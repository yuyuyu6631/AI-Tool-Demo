import fs from "node:fs/promises";
import path from "node:path";

export const REQUIRED_MENU_OVERVIEW_SCENES = Object.freeze([
  "home-overview",
  "nav-tools",
  "nav-rankings",
  "nav-scenarios",
  "tools-shortcuts",
  "tools-presets",
  "tools-sort",
  "tools-categories",
  "tools-price",
  "tools-tags",
  "tools-more-categories",
  "tools-more-tags",
]);

export const VALID_ACTION_TYPES = Object.freeze([
  "goto",
  "click",
  "clickHeaderNav",
  "hold",
  "hover",
  "press",
  "scrollIntoView",
  "scrollToTop",
  "smoothWheel",
  "type",
  "waitForURL",
]);

const HEADER_NAV_FILE = path.join("apps", "web", "src", "app", "components", "header-nav.ts");

function getHeaderLabel(labelByHref, href, fallback) {
  return labelByHref.get(href) || fallback;
}

export async function readHeaderNavItems(repoRoot) {
  const filePath = path.join(repoRoot, HEADER_NAV_FILE);
  const source = await fs.readFile(filePath, "utf8");
  const items = Array.from(source.matchAll(/\{\s*href:\s*"([^"]+)",\s*label:\s*"([^"]+)"\s*\}/g)).map((match) => ({
    href: match[1],
    label: match[2],
  }));

  if (items.length < 4) {
    throw new Error(`Unable to read header nav items from ${filePath}`);
  }

  return items;
}

export async function buildDemoScenes({ repoRoot }) {
  const headerNavItems = await readHeaderNavItems(repoRoot);
  const labelByHref = new Map(headerNavItems.map((item) => [item.href, item.label]));

  return [
    {
      id: "home-overview",
      section: "menu-overview",
      label: getHeaderLabel(labelByHref, "/", "首页"),
      route: "/",
      subtitle: "首页先展示推荐入口、常用分类和精选工具，是系统导航的起点。",
      includeInManifest: true,
      steps: [
        { type: "goto", path: "/" },
        { type: "hold", ms: 1200 },
        { type: "smoothWheel", distance: 420, steps: 4, waitMs: 220 },
        { type: "hold", ms: 700 },
        { type: "scrollToTop" },
      ],
    },
    {
      id: "nav-tools",
      section: "menu-overview",
      label: getHeaderLabel(labelByHref, "/tools", "工具目录"),
      route: "/tools",
      subtitle: `${getHeaderLabel(labelByHref, "/tools", "工具目录")}入口用于进入完整工具目录，适合继续搜索、筛选和比对。`,
      includeInManifest: true,
      steps: [
        { type: "clickHeaderNav", href: "/tools" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "nav-rankings",
      section: "menu-overview",
      label: getHeaderLabel(labelByHref, "/rankings", "榜单"),
      route: "/rankings",
      subtitle: `${getHeaderLabel(labelByHref, "/rankings", "榜单")}页集中展示按主题整理的推荐榜单，方便快速查看优先级。`,
      includeInManifest: true,
      steps: [
        { type: "clickHeaderNav", href: "/rankings" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "nav-scenarios",
      section: "menu-overview",
      label: getHeaderLabel(labelByHref, "/scenarios", "场景"),
      route: "/scenarios",
      subtitle: `${getHeaderLabel(labelByHref, "/scenarios", "场景")}页按真实任务组织入口，帮助用户先按问题再找工具。`,
      includeInManifest: true,
      steps: [
        { type: "clickHeaderNav", href: "/scenarios" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "tools-shortcuts",
      section: "menu-overview",
      label: "决策快捷入口",
      route: "/tools",
      subtitle: "工具目录顶部先给出决策快捷入口，方便按常用条件快速缩小范围。",
      includeInManifest: true,
      steps: [
        { type: "goto", path: "/tools" },
        { type: "hold", ms: 800 },
        { type: "hover", target: "toolsQuickDecisionChip" },
        { type: "hold", ms: 1400 },
      ],
    },
    {
      id: "tools-presets",
      section: "menu-overview",
      label: "预设视图",
      route: "/tools",
      subtitle: "预设视图把热门、最新等目录视角单独整理，适合直接切到当前关注的结果集。",
      includeInManifest: true,
      steps: [
        { type: "hover", target: "toolsPresetChip" },
        { type: "hold", ms: 1600 },
      ],
    },
    {
      id: "tools-sort",
      section: "menu-overview",
      label: "排序",
      route: "/tools",
      subtitle: "排序菜单用于切换目录的展示顺序，方便从热度、最新和名称不同角度查看。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsSortChip" },
        { type: "hover", target: "toolsSortChip" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "tools-categories",
      section: "menu-overview",
      label: "分类",
      route: "/tools",
      subtitle: "分类菜单负责按能力方向筛选工具，是目录里的主要导航分组。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsCategoryLink" },
        { type: "hover", target: "toolsCategoryLink" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "tools-price",
      section: "menu-overview",
      label: "价格",
      route: "/tools",
      subtitle: "价格菜单把免费、订阅等成本维度单独提出来，方便先过滤预算约束。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsPriceChip" },
        { type: "hover", target: "toolsPriceChip" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "tools-tags",
      section: "menu-overview",
      label: "标签",
      route: "/tools",
      subtitle: "标签菜单补充更细的能力特征，适合在分类之外继续缩小结果范围。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsTagChip" },
        { type: "hover", target: "toolsTagChip" },
        { type: "hold", ms: 1500 },
      ],
    },
    {
      id: "tools-more-categories",
      section: "menu-overview",
      label: "查看更多分类",
      route: "/tools",
      subtitle: "展开更多分类后，可以查看完整分类列表，避免隐藏项影响演示完整度。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsMoreCategoriesSummary" },
        { type: "click", target: "toolsMoreCategoriesSummary" },
        { type: "hold", ms: 900 },
        { type: "hover", target: "toolsMoreCategoriesLink" },
        { type: "hold", ms: 900 },
      ],
    },
    {
      id: "tools-more-tags",
      section: "menu-overview",
      label: "更多标签",
      route: "/tools",
      subtitle: "展开更多标签后，目录里的长尾能力标签也会完整展示。",
      includeInManifest: true,
      steps: [
        { type: "scrollIntoView", target: "toolsMoreTagsSummary" },
        { type: "click", target: "toolsMoreTagsSummary" },
        { type: "hold", ms: 900 },
        { type: "hover", target: "toolsMoreTagsChip" },
        { type: "hold", ms: 900 },
      ],
    },
    {
      id: "search-tools",
      section: "workflow-main",
      label: "目录搜索",
      route: "/tools?view=latest&q=Wolfram",
      subtitle: "菜单总览之后回到主线，通过搜索可以从完整目录里快速定位目标工具。",
      includeInManifest: true,
      steps: [
        { type: "goto", path: "/tools?view=latest" },
        { type: "hold", ms: 1000 },
        { type: "click", target: "toolsSearchInput" },
        { type: "type", target: "toolsSearchInput", text: "Wolfram", delay: 90 },
        { type: "hold", ms: 400 },
        { type: "press", target: "toolsSearchInput", key: "Enter" },
        { type: "waitForURL", pattern: "/\\/tools\\?.*q=Wolfram/i" },
        { type: "hold", ms: 1400 },
      ],
    },
    {
      id: "open-detail",
      section: "workflow-main",
      label: "详情页",
      route: "/tools/wolframalpha",
      subtitle: "进入详情页后，可以继续查看摘要、状态和推荐关系。",
      includeInManifest: true,
      steps: [
        { type: "click", target: "wolframDetailLink" },
        { type: "waitForURL", pattern: "/\\/tools\\/wolframalpha(?:\\?.*)?$/" },
        { type: "hold", ms: 1600 },
      ],
    },
    {
      id: "detail-information",
      section: "workflow-main",
      label: "详情信息",
      route: "/tools/wolframalpha",
      subtitle: "继续下滑可以看到更完整的工具信息、标签和同类推荐。",
      includeInManifest: true,
      steps: [
        { type: "smoothWheel", distance: 620, steps: 4, waitMs: 240 },
        { type: "hold", ms: 900 },
      ],
    },
    {
      id: "return-and-refine",
      section: "workflow-main",
      label: "回列表二筛",
      route: "/tools",
      subtitle: "回到目录后再按分类二次筛选，展示系统从导航到详情再回列表的完整工作流。",
      includeInManifest: true,
      steps: [
        { type: "click", target: "detailBackToList" },
        { type: "waitForURL", pattern: "/\\/tools(?:\\?.*)?$/" },
        { type: "hold", ms: 1000 },
        { type: "click", target: "refinedCategoryLink" },
        { type: "waitForURL", pattern: "/\\/tools\\?.*category=/i" },
        { type: "hold", ms: 1500 },
      ],
    },
  ];
}

export function validateDemoScenes(scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("Demo scenes must be a non-empty array");
  }

  const seenIds = new Set();

  for (const scene of scenes) {
    if (!scene || typeof scene !== "object") {
      throw new Error("Each scene must be an object");
    }
    if (!scene.id || typeof scene.id !== "string") {
      throw new Error("Each scene must have a string id");
    }
    if (seenIds.has(scene.id)) {
      throw new Error(`Duplicate scene id: ${scene.id}`);
    }
    seenIds.add(scene.id);

    if (!scene.label || typeof scene.label !== "string") {
      throw new Error(`Scene ${scene.id} must have a label`);
    }
    if (!scene.subtitle || typeof scene.subtitle !== "string") {
      throw new Error(`Scene ${scene.id} must have a subtitle`);
    }
    if (!scene.route || typeof scene.route !== "string") {
      throw new Error(`Scene ${scene.id} must have a route`);
    }
    if (!Array.isArray(scene.steps) || scene.steps.length === 0) {
      throw new Error(`Scene ${scene.id} must define steps`);
    }

    for (const [index, step] of scene.steps.entries()) {
      if (!step || typeof step !== "object") {
        throw new Error(`Scene ${scene.id} step ${index} must be an object`);
      }
      if (!VALID_ACTION_TYPES.includes(step.type)) {
        throw new Error(`Scene ${scene.id} step ${index} uses unsupported action type ${step.type}`);
      }
      if (step.type === "goto" && typeof step.path !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define a path`);
      }
      if (step.type === "waitForURL" && typeof step.pattern !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define a URL pattern`);
      }
      if (["click", "hover", "press", "scrollIntoView", "type"].includes(step.type) && typeof step.target !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define a target`);
      }
      if (step.type === "clickHeaderNav" && typeof step.href !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define a header href`);
      }
      if (step.type === "hold" && typeof step.ms !== "number") {
        throw new Error(`Scene ${scene.id} step ${index} must define hold milliseconds`);
      }
      if (step.type === "type" && typeof step.text !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define text`);
      }
      if (step.type === "press" && typeof step.key !== "string") {
        throw new Error(`Scene ${scene.id} step ${index} must define a key`);
      }
    }
  }

  const menuOverviewIds = scenes.filter((scene) => scene.section === "menu-overview").map((scene) => scene.id);
  const requiredSequence = REQUIRED_MENU_OVERVIEW_SCENES.join("|");
  const actualSequence = menuOverviewIds.slice(0, REQUIRED_MENU_OVERVIEW_SCENES.length).join("|");

  if (requiredSequence !== actualSequence) {
    throw new Error("Menu overview scenes are missing or out of order");
  }
}
