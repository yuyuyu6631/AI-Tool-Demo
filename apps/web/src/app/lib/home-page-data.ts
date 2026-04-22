import { buildToolsHref } from "./catalog-utils";
import type {
  FacetOption,
  HomeCategorySection,
  HomeQuickEntry,
  HomeSidebarCategory,
  ToolSummary,
  ToolsDirectoryResponse,
} from "./catalog-types";

export const HOME_GRID_COLUMNS = 4;
const HOME_SECTION_MAX_ITEMS = 8;

export interface HomeCategoryRule {
  homeSlug: string;
  label: string;
  description: string;
  matchLabels: string[];
}

interface ResolvedHomeCategoryMatch {
  rule: HomeCategoryRule;
  category: FacetOption;
}

const HOME_CATEGORY_WHITELIST: HomeCategoryRule[] = [
  {
    homeSlug: "ai-chat",
    label: "AI聊天助手",
    description: "适合问答、搜索、对话和日常助理场景。",
    matchLabels: ["AI聊天助手", "通用助手", "AI搜索引擎"],
  },
  {
    homeSlug: "ai-office",
    label: "AI办公工具",
    description: "覆盖文档处理、总结协作与办公提效。",
    matchLabels: ["AI办公工具", "AI文档办公", "写作办公"],
  },
  {
    homeSlug: "ai-agent",
    label: "AI智能体",
    description: "用于构建智能体、工作流与自动化应用。",
    matchLabels: ["AI智能体", "AI开发平台", "智能体平台"],
  },
  {
    homeSlug: "ai-image",
    label: "AI图像工具",
    description: "聚合图像生成、修图、设计与素材创作工具。",
    matchLabels: ["AI图像", "AI图像工具", "设计绘图", "设计创作"],
  },
  {
    homeSlug: "ai-video",
    label: "AI视频工具",
    description: "包含视频生成、剪辑、字幕和音视频创作。",
    matchLabels: ["AI视频", "AI视频工具", "视频音频"],
  },
  {
    homeSlug: "ai-writing",
    label: "AI写作工具",
    description: "适合写作、润色、翻译和内容生成任务。",
    matchLabels: ["AI写作", "AI写作工具"],
  },
  {
    homeSlug: "ai-coding",
    label: "AI编程工具",
    description: "面向代码生成、开发提效与工程协作。",
    matchLabels: ["AI代码编程", "AI编程工具", "编程开发"],
  },
  {
    homeSlug: "ai-audio",
    label: "AI音频工具",
    description: "用于配音、音乐生成与语音处理。",
    matchLabels: ["AI音频音乐", "AI音频工具", "AI音频"],
  },
];

const GARBAGE_NAME_PATTERNS = [
  /^test(?:ing)?$/i,
  /^demo$/i,
  /^sample$/i,
  /^temp$/i,
  /^untitled$/i,
  /^placeholder$/i,
  /^cc['’`-]?\d+$/i,
  /^\d+$/,
  /^tool[-_\s]?\d+$/i,
];

const GARBAGE_SUMMARY_PATTERNS = [/^test$/i, /^demo$/i, /^placeholder$/i, /^todo$/i, /^tbd$/i];

type HomeDataLogoCheck = (tool: ToolSummary) => Promise<boolean>;

export interface BuildHomePageDataInput {
  hotDirectory: ToolsDirectoryResponse;
  latestDirectory: ToolsDirectoryResponse;
  categoriesDirectory: ToolsDirectoryResponse;
  categoryDirectories: Record<string, ToolsDirectoryResponse>;
  hasRenderableLogo: HomeDataLogoCheck;
}

export interface HomePageDataPayload {
  quickEntries: HomeQuickEntry[];
  hotTools: ToolSummary[];
  latestTools: ToolSummary[];
  sidebarCategories: HomeSidebarCategory[];
  categorySections: HomeCategorySection[];
}

function normalizeCompact(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function buildSectionId(homeSlug: string) {
  return `section-${homeSlug}`;
}

function hasValidOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasMeaningfulSummary(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 8 && !GARBAGE_SUMMARY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isGarbageName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;

  const compact = trimmed.replace(/[\s'"’`_-]+/g, "");
  return GARBAGE_NAME_PATTERNS.some((pattern) => pattern.test(trimmed) || pattern.test(compact));
}

function resolveHomeCategoryMatches(categories: ToolsDirectoryResponse["categories"]) {
  const matches: ResolvedHomeCategoryMatch[] = [];
  const matchedCategorySlugs = new Set<string>();

  for (const rule of HOME_CATEGORY_WHITELIST) {
    const category = categories.find((item) => {
      if (matchedCategorySlugs.has(item.slug)) return false;
      const label = normalizeCompact(item.label);
      return rule.matchLabels.some((candidate) => normalizeCompact(candidate) === label);
    });

    if (!category) continue;

    matchedCategorySlugs.add(category.slug);
    matches.push({ rule, category });
  }

  return matches;
}

function sortForHot(a: ToolSummary, b: ToolSummary) {
  if (Number(b.featured) !== Number(a.featured)) return Number(b.featured) - Number(a.featured);
  if ((b.reviewCount ?? 0) !== (a.reviewCount ?? 0)) return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

function sortForLatest(a: ToolSummary, b: ToolSummary) {
  const createdAtDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  if (createdAtDiff !== 0) return createdAtDiff;
  if (Number(b.featured) !== Number(a.featured)) return Number(b.featured) - Number(a.featured);
  if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
  return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
}

export function trimToFullRows<T>(items: T[], columns = HOME_GRID_COLUMNS) {
  if (items.length <= columns) {
    return items;
  }

  const fullRowsCount = Math.floor(items.length / columns) * columns;
  return fullRowsCount > 0 ? items.slice(0, fullRowsCount) : items;
}

export function getHomeCategoryDirectorySlugs(categories: ToolsDirectoryResponse["categories"]) {
  return resolveHomeCategoryMatches(categories).map((match) => match.category.slug);
}

export function isGarbageTool(tool: Pick<ToolSummary, "name" | "summary" | "slug">) {
  const summaryCompact = normalizeCompact(tool.summary);
  const nameCompact = normalizeCompact(tool.name);

  return (
    !tool.slug?.trim() ||
    isGarbageName(tool.name) ||
    !hasMeaningfulSummary(tool.summary) ||
    summaryCompact === nameCompact ||
    summaryCompact === normalizeCompact(tool.slug)
  );
}

export function isRenderableHomeCard(tool: ToolSummary) {
  return (
    tool.status === "published" &&
    Boolean(tool.slug?.trim()) &&
    Boolean(tool.category?.trim()) &&
    hasValidOfficialUrl(tool.officialUrl) &&
    hasMeaningfulSummary(tool.summary) &&
    !isGarbageTool(tool)
  );
}

export function dedupeHomeTools(items: ToolSummary[]) {
  const seenSlugs = new Set<string>();
  const seenNames = new Set<string>();
  const result: ToolSummary[] = [];

  for (const item of items) {
    const slugKey = normalizeSlug(item.slug);
    const nameKey = normalizeCompact(item.name);
    if (seenSlugs.has(slugKey) || seenNames.has(nameKey)) continue;
    seenSlugs.add(slugKey);
    seenNames.add(nameKey);
    result.push(item);
  }

  return result;
}

export async function sanitizeHomeTools(
  items: ToolSummary[],
  options: { hasRenderableLogo?: HomeDataLogoCheck } = {},
) {
  const candidates = items.filter(isRenderableHomeCard);
  const withRenderableLogos = options.hasRenderableLogo
    ? (
        await Promise.all(
          candidates.map(async (tool) => ((await options.hasRenderableLogo!(tool)) ? tool : null)),
        )
      ).filter(Boolean) as ToolSummary[]
    : candidates;

  return dedupeHomeTools(withRenderableLogos);
}

export function pickHotTools(items: ToolSummary[], maxItems = HOME_SECTION_MAX_ITEMS) {
  return trimToFullRows([...items].sort(sortForHot).slice(0, maxItems));
}

export function pickLatestTools(
  items: ToolSummary[],
  excludedSlugs: Set<string>,
  maxItems = HOME_SECTION_MAX_ITEMS,
) {
  return trimToFullRows(
    items
      .filter((tool) => !excludedSlugs.has(normalizeSlug(tool.slug)))
      .sort(sortForLatest)
      .slice(0, maxItems),
  );
}

export async function buildHomeCategorySections({
  categories,
  categoryDirectories,
  excludedSlugs,
  hasRenderableLogo,
}: {
  categories: ToolsDirectoryResponse["categories"];
  categoryDirectories: Record<string, ToolsDirectoryResponse>;
  excludedSlugs: Set<string>;
  hasRenderableLogo: HomeDataLogoCheck;
}) {
  const sections: HomeCategorySection[] = [];

  for (const { rule, category } of resolveHomeCategoryMatches(categories)) {
    const directory = categoryDirectories[category.slug];
    if (!directory) continue;

    const cleanedItems = await sanitizeHomeTools(directory.items, { hasRenderableLogo });
    const uniqueItems = cleanedItems.filter((tool) => !excludedSlugs.has(normalizeSlug(tool.slug)));
    const sectionItems = trimToFullRows(uniqueItems).slice(0, HOME_SECTION_MAX_ITEMS);

    if (sectionItems.length < HOME_GRID_COLUMNS) continue;

    sections.push({
      homeSlug: rule.homeSlug,
      label: rule.label,
      description: rule.description,
      sectionId: buildSectionId(rule.homeSlug),
      browseCategorySlug: category.slug,
      items: sectionItems,
      moreHref: buildToolsHref({}, { mode: "search", category: category.slug, page: 1, source: "home_category" }),
    });
  }

  return sections;
}

export function buildSidebarCategories(sections: HomeCategorySection[]): HomeSidebarCategory[] {
  return sections.map((section) => ({
    homeSlug: section.homeSlug,
    label: section.label,
    count: section.items.length,
    sectionId: section.sectionId,
    description: section.description,
    navigationType: "anchor",
    href: `#${section.sectionId}`,
  }));
}

export async function buildHomePageData({
  hotDirectory,
  latestDirectory,
  categoriesDirectory,
  categoryDirectories,
  hasRenderableLogo,
}: BuildHomePageDataInput): Promise<HomePageDataPayload> {
  const sanitizedHotCandidates = await sanitizeHomeTools(hotDirectory.items, { hasRenderableLogo });
  const hotTools = pickHotTools(sanitizedHotCandidates);

  const hotSlugs = new Set(hotTools.map((tool) => normalizeSlug(tool.slug)));
  const sanitizedLatestCandidates = await sanitizeHomeTools(latestDirectory.items, { hasRenderableLogo });
  const latestTools = pickLatestTools(sanitizedLatestCandidates, hotSlugs);

  const excludedSlugs = new Set([...hotTools, ...latestTools].map((tool) => normalizeSlug(tool.slug)));

  const categorySections = await buildHomeCategorySections({
    categories: categoriesDirectory.categories,
    categoryDirectories,
    excludedSlugs,
    hasRenderableLogo,
  });

  return {
    quickEntries: [],
    hotTools,
    latestTools,
    sidebarCategories: buildSidebarCategories(categorySections),
    categorySections,
  };
}
