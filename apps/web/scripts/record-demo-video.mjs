import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { buildDemoScenes, readHeaderNavItems, validateDemoScenes } from "./demo-video-scenes.mjs";

const repoRoot = path.resolve(process.cwd(), "..", "..");
const outputRoot = path.join(repoRoot, "output", "demo");
const baseURL = process.env.DEMO_BASE_URL || "http://127.0.0.1:3100";

const cues = [];
let timelineMs = 0;

function formatSrtTime(valueMs) {
  const totalMs = Math.max(0, Math.round(valueMs));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  const milliseconds = totalMs % 1_000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function buildAbsoluteUrl(targetPath) {
  return new URL(targetPath, `${baseURL.replace(/\/$/, "")}/`).toString();
}

async function hold(page, ms) {
  timelineMs += ms;
  await page.waitForTimeout(ms);
}

async function smoothWheel(page, distance, steps = 6, waitMs = 220) {
  const stepDistance = distance / steps;
  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, stepDistance);
    await hold(page, waitMs);
  }
}

async function typeSlow(locator, value, delay = 90) {
  await locator.fill("");
  for (const char of value) {
    await locator.type(char, { delay });
  }
}

async function resolveTarget(page, target) {
  const resolvers = {
    toolsQuickDecisionChip: () => page.locator('form[action="/tools"]').locator('a[href*="view="], a[href*="price="]').first(),
    toolsPresetChip: () => page.locator('main a[href="/tools?view=free&page=1"]').first(),
    toolsSortChip: () => page.locator('aside a[href*="sort="]').first(),
    toolsCategoryLink: () => page.locator('aside a[href*="category="]').first(),
    toolsPriceChip: () => page.locator('aside a[href*="price="]').first(),
    toolsTagChip: () => page.locator('aside a[href*="tag="]').first(),
    toolsMoreCategoriesSummary: () => page.locator("aside details summary").first(),
    toolsMoreCategoriesLink: () => page.locator("aside details").first().locator('a[href*="category="]').first(),
    toolsMoreTagsSummary: () => page.locator("aside details summary").nth(1),
    toolsMoreTagsChip: () => page.locator("aside details").nth(1).locator('a[href*="tag="]').first(),
    toolsSearchInput: () => page.locator('input[name="q"]').first(),
    wolframDetailLink: () => page.locator('a[href="/tools/wolframalpha"]').first(),
    detailBackToList: () => page.locator('main a[href="/tools"]').last(),
    refinedCategoryLink: () => page.locator('aside a[href*="category="]').first(),
  };

  const resolver = resolvers[target];
  if (!resolver) {
    throw new Error(`Unknown target: ${target}`);
  }

  const locator = resolver();
  if ((await locator.count()) === 0) {
    throw new Error(`Target not found: ${target}`);
  }

  return locator.first();
}

async function executeStep(page, step) {
  switch (step.type) {
    case "goto": {
      await page.goto(buildAbsoluteUrl(step.path), { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    case "clickHeaderNav": {
      const locator = page.locator(`header nav a[href="${step.href}"]`).first();
      if ((await locator.count()) === 0) {
        throw new Error(`Header nav item not found: ${step.href}`);
      }
      await locator.click();
      await page.waitForURL((url) => url.pathname === step.href);
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    case "click": {
      const locator = await resolveTarget(page, step.target);
      await locator.click();
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    case "hold": {
      await hold(page, step.ms);
      break;
    }
    case "hover": {
      const locator = await resolveTarget(page, step.target);
      await locator.hover();
      break;
    }
    case "press": {
      const locator = await resolveTarget(page, step.target);
      await locator.press(step.key);
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    case "scrollIntoView": {
      const locator = await resolveTarget(page, step.target);
      await locator.scrollIntoViewIfNeeded();
      await hold(page, 500);
      break;
    }
    case "scrollToTop": {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await hold(page, 400);
      break;
    }
    case "smoothWheel": {
      await smoothWheel(page, step.distance, step.steps, step.waitMs);
      break;
    }
    case "type": {
      const locator = await resolveTarget(page, step.target);
      await typeSlow(locator, step.text, step.delay ?? 90);
      break;
    }
    case "waitForURL": {
      const pattern = new RegExp(step.pattern.slice(1, step.pattern.lastIndexOf("/")), step.pattern.slice(step.pattern.lastIndexOf("/") + 1));
      await page.waitForURL(pattern);
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    default:
      throw new Error(`Unsupported step type: ${step.type}`);
  }
}

async function recordScenes(page, scenes) {
  const sceneResults = [];

  for (const scene of scenes) {
    console.log(`Recording scene ${scene.id}`);
    const startMs = timelineMs;

    for (const step of scene.steps) {
      await executeStep(page, step);
    }

    const endMs = timelineMs;
    const currentUrl = new URL(page.url());
    const resolvedRoute = `${currentUrl.pathname}${currentUrl.search}`;

    cues.push({
      id: scene.id,
      startMs,
      endMs,
      text: scene.subtitle,
    });

    if (scene.includeInManifest !== false) {
      sceneResults.push({
        id: scene.id,
        section: scene.section,
        label: scene.label,
        route: resolvedRoute,
        plannedRoute: scene.route,
        subtitle: scene.subtitle,
        startMs,
        endMs,
      });
    }
  }

  return sceneResults;
}

async function main() {
  const headerNavItems = await readHeaderNavItems(repoRoot);
  const scenes = await buildDemoScenes({ repoRoot });
  validateDemoScenes(scenes);

  if (process.env.DEMO_VALIDATE_ONLY === "1") {
    console.log(`Validated ${scenes.length} scenes`);
    return;
  }

  const sessionId = new Date().toISOString().replace(/[:.]/g, "-");
  const videoRoot = path.join(outputRoot, "raw", sessionId);
  await fs.mkdir(videoRoot, { recursive: true });
  console.log(`Recording demo from ${baseURL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    screen: { width: 1600, height: 900 },
    recordVideo: {
      dir: videoRoot,
      size: { width: 1600, height: 900 },
    },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(20_000);

  const sceneResults = await recordScenes(page, scenes);

  await context.close();
  await browser.close();

  const [videoFile] = await fs.readdir(videoRoot);
  const rawVideoPath = path.join(videoRoot, videoFile);
  const finalRawVideoPath = path.join(outputRoot, "system-demo-raw.webm");
  await fs.copyFile(rawVideoPath, finalRawVideoPath);

  const srtContent = cues
    .map((cue, index) => `${index + 1}\n${formatSrtTime(cue.startMs)} --> ${formatSrtTime(cue.endMs)}\n${cue.text}\n`)
    .join("\n");

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseURL,
    durationMs: timelineMs,
    rawVideoPath: finalRawVideoPath,
    subtitlesPath: path.join(outputRoot, "system-demo.srt"),
    headerNavItems,
    scenes: sceneResults,
    cues,
  };

  await fs.writeFile(path.join(outputRoot, "system-demo.srt"), srtContent, "utf8");
  await fs.writeFile(path.join(outputRoot, "system-demo-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Raw video saved to ${finalRawVideoPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
