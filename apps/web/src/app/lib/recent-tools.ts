"use client";

export interface RecentToolItem {
  slug: string;
  name: string;
  summary: string;
  category?: string;
  viewedAt: number;
}

export const RECENT_TOOLS_KEY = "xingdianping:recent-tools";
const RECENT_TOOLS_LIMIT = 6;

function isRecentToolItem(value: unknown): value is RecentToolItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RecentToolItem>;
  return typeof item.slug === "string" && typeof item.name === "string" && typeof item.viewedAt === "number";
}

export function readRecentTools() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_TOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentToolItem).slice(0, RECENT_TOOLS_LIMIT);
  } catch {
    return [];
  }
}

export function rememberRecentTool(tool: Omit<RecentToolItem, "viewedAt">) {
  if (typeof window === "undefined" || !tool.slug || !tool.name) return;

  const nextItem: RecentToolItem = {
    slug: tool.slug,
    name: tool.name,
    summary: tool.summary || "工具信息待补充",
    category: tool.category,
    viewedAt: Date.now(),
  };
  const nextItems = [nextItem, ...readRecentTools().filter((item) => item.slug !== tool.slug)].slice(0, RECENT_TOOLS_LIMIT);

  try {
    window.localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(nextItems));
  } catch {
    // Ignore storage failures so browsing never blocks the user.
  }
}
