import {
  buildHomeCategorySections,
  buildSidebarCategories,
  getHomeCategoryDirectorySlugs,
  isRenderableHomeCard,
  pickHotTools,
  pickLatestTools,
  sanitizeHomeTools,
} from "../home-page-data";
import type { ToolSummary, ToolsDirectoryResponse } from "../catalog-types";

const baseTool: ToolSummary = {
  id: 1,
  slug: "chatgpt",
  name: "ChatGPT",
  category: "AI聊天助手",
  score: 9.5,
  summary: "适合写作、分析和代码协作的成熟 AI 助手。",
  tags: ["聊天", "写作"],
  officialUrl: "https://chat.openai.com",
  logoPath: "/logos/chatgpt.png",
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-03-01",
  price: "",
  reviewCount: 10,
  accessFlags: { needsVpn: false, cnLang: true, cnPayment: true },
};

function makeTool(overrides: Partial<ToolSummary> = {}): ToolSummary {
  return {
    ...baseTool,
    id: overrides.id ?? baseTool.id,
    slug: overrides.slug ?? `tool-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name ?? "Tool Name",
    createdAt: overrides.createdAt ?? "2026-03-01",
    reviewCount: overrides.reviewCount ?? 6,
    score: overrides.score ?? 8.8,
    summary: overrides.summary ?? "适合首页展示的真实工具摘要。",
    officialUrl: overrides.officialUrl ?? "https://example.com/tool",
    category: overrides.category ?? "AI聊天助手",
    logoPath: overrides.logoPath ?? "/logos/tool.png",
    status: overrides.status ?? "published",
    featured: overrides.featured ?? false,
    tags: overrides.tags ?? ["通用"],
    price: overrides.price ?? "",
    ...overrides,
  };
}

const emptyDirectory: ToolsDirectoryResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 8,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

describe("home page data rules", () => {
  it("filters obvious garbage and incomplete tools before homepage rendering", async () => {
    const validTool = makeTool({ slug: "valid-tool", name: "Valid Tool" });
    const garbageTool = makeTool({
      slug: "placeholder-1",
      name: "Placeholder",
      summary: "Placeholder",
    });
    const missingUrlTool = makeTool({
      slug: "no-url",
      name: "No URL",
      officialUrl: "",
    });
    const noLogoTool = makeTool({
      slug: "no-logo",
      name: "No Logo",
      logoPath: null,
    });

    expect(isRenderableHomeCard(validTool)).toBe(true);
    expect(isRenderableHomeCard(garbageTool)).toBe(false);
    expect(isRenderableHomeCard(missingUrlTool)).toBe(false);

    const tools = await sanitizeHomeTools([validTool, garbageTool, missingUrlTool, noLogoTool], {
      hasRenderableLogo: async (tool) => tool.slug !== "no-logo",
    });

    expect(tools.map((tool) => tool.slug)).toEqual(["valid-tool"]);
  });

  it("keeps hot and latest sections semantically distinct by deduping overlap", () => {
    const hotSeed = [
      makeTool({ slug: "hot-1", name: "Hot 1", featured: true, reviewCount: 20, score: 9.8 }),
      makeTool({ slug: "hot-2", name: "Hot 2", featured: true, reviewCount: 18, score: 9.6 }),
      makeTool({ slug: "hot-3", name: "Hot 3", reviewCount: 15, score: 9.4 }),
      makeTool({ slug: "hot-4", name: "Hot 4", reviewCount: 12, score: 9.1 }),
    ];
    const latestSeed = [
      makeTool({ slug: "hot-2", name: "Hot 2", createdAt: "2026-04-12" }),
      makeTool({ slug: "latest-1", name: "Latest 1", createdAt: "2026-04-16" }),
      makeTool({ slug: "latest-2", name: "Latest 2", createdAt: "2026-04-15" }),
      makeTool({ slug: "latest-3", name: "Latest 3", createdAt: "2026-04-14" }),
      makeTool({ slug: "latest-4", name: "Latest 4", createdAt: "2026-04-13" }),
    ];

    const hotTools = pickHotTools(hotSeed);
    const latestTools = pickLatestTools(latestSeed, new Set(hotTools.map((tool) => tool.slug)));

    expect(hotTools.map((tool) => tool.slug)).toEqual(["hot-1", "hot-2", "hot-3", "hot-4"]);
    expect(latestTools.map((tool) => tool.slug)).toEqual(["latest-1", "latest-2", "latest-3", "latest-4"]);
  });

  it("derives category fetch slugs from whitelist order instead of API order", () => {
    const categoriesDirectory: ToolsDirectoryResponse = {
      ...emptyDirectory,
      categories: [
        { slug: "image", label: "AI图像工具", count: 20 },
        { slug: "chat", label: "AI聊天助手", count: 20 },
        { slug: "office", label: "AI办公工具", count: 20 },
        { slug: "random", label: "随机分类", count: 20 },
      ],
    };

    expect(getHomeCategoryDirectorySlugs(categoriesDirectory.categories)).toEqual(["chat", "office", "image"]);
  });

  it("builds homepage category sections from whitelist order and keeps sidebar in sync", async () => {
    const categoriesDirectory: ToolsDirectoryResponse = {
      ...emptyDirectory,
      categories: [
        { slug: "image", label: "AI图像工具", count: 20 },
        { slug: "chat", label: "AI聊天助手", count: 20 },
        { slug: "office", label: "AI办公工具", count: 20 },
      ],
    };

    const chatItems = [
      makeTool({ slug: "hot-1", name: "Hot 1", category: "AI聊天助手" }),
      makeTool({ slug: "chat-2", name: "Chat 2", category: "AI聊天助手" }),
      makeTool({ slug: "chat-3", name: "Chat 3", category: "AI聊天助手" }),
      makeTool({ slug: "chat-4", name: "Chat 4", category: "AI聊天助手" }),
      makeTool({ slug: "chat-5", name: "Chat 5", category: "AI聊天助手" }),
      makeTool({ slug: "chat-6", name: "Chat 6", category: "AI聊天助手" }),
    ];
    const officeItems = [
      makeTool({ slug: "office-1", name: "Office 1", category: "AI办公工具" }),
      makeTool({ slug: "office-2", name: "Office 2", category: "AI办公工具" }),
      makeTool({ slug: "office-3", name: "Office 3", category: "AI办公工具" }),
    ];
    const imageItems = [
      makeTool({ slug: "image-1", name: "Image 1", category: "AI图像工具" }),
      makeTool({ slug: "image-2", name: "Image 2", category: "AI图像工具" }),
      makeTool({ slug: "image-3", name: "Image 3", category: "AI图像工具" }),
      makeTool({ slug: "image-4", name: "Image 4", category: "AI图像工具" }),
    ];

    const sections = await buildHomeCategorySections({
      categories: categoriesDirectory.categories,
      categoryDirectories: {
        chat: { ...emptyDirectory, items: chatItems },
        office: { ...emptyDirectory, items: officeItems },
        image: { ...emptyDirectory, items: imageItems },
      },
      excludedSlugs: new Set(["hot-1"]),
      hasRenderableLogo: async () => true,
    });

    expect(sections.map((section) => section.homeSlug)).toEqual(["ai-chat", "ai-image"]);
    expect(sections[0].items.map((tool) => tool.slug)).toEqual(["chat-2", "chat-3", "chat-4", "chat-5"]);
    expect(sections[0].browseCategorySlug).toBe("chat");
    expect(sections[0].moreHref).toBe("/?mode=search&category=chat&page=1&source=home_category");
    expect(sections[1].items).toHaveLength(4);

    const sidebar = buildSidebarCategories(sections);
    expect(sidebar).toEqual([
      expect.objectContaining({ homeSlug: "ai-chat", count: 4, sectionId: "section-ai-chat" }),
      expect.objectContaining({ homeSlug: "ai-image", count: 4, sectionId: "section-ai-image" }),
    ]);
  });
});
