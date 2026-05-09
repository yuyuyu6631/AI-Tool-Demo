import React from "react";
import { render } from "@testing-library/react";
import HomeRoute from "../page";
import ToolsRoute from "../tools/page";
import HomePage from "@/src/app/pages/HomePage";
import ToolsPage from "@/src/app/pages/ToolsPage";
import type { AiSearchResponse, ToolsDirectoryResponse } from "@/src/app/lib/catalog-types";
import { fetchAiSearch, fetchDirectory, fetchScenarios } from "@/src/app/lib/catalog-api";

vi.mock("@/src/app/pages/HomePage", () => ({
  default: vi.fn(() => <main>Home</main>),
}));

vi.mock("@/src/app/pages/ToolsPage", () => ({
  default: vi.fn(() => <main>Tools</main>),
}));

const directory: ToolsDirectoryResponse = {
  items: [
    {
      id: 1,
      slug: "gamma",
      name: "Gamma",
      category: "Office",
      categorySlug: "office",
      score: 8.8,
      summary: "AI presentation builder.",
      tags: ["PPT"],
      officialUrl: "https://example.com/gamma",
      status: "published",
      featured: true,
      createdAt: "2026-04-01",
      price: "",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 24,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
  meta: null,
};

const aiSearch: AiSearchResponse = {
  mode: "ai",
  query: "做PPT",
  normalized_query: "presentation ppt",
  ai_panel: {
    title: "AI 帮你理解了这个需求",
    user_need: "做PPT",
    system_understanding: "用户希望按 PPT 任务筛选工具",
    active_logic: ["PPT / 演示场景"],
    quick_actions: [],
  },
  results: [
    {
      ...directory.items[0],
      reason: "适合快速生成演示初稿。",
    },
  ],
  directory,
  meta: {
    latency_ms: 42,
    cache_hit: false,
    intent_source: "fallback",
    search_provider: "legacy",
    search_degraded: false,
    normalized_search_query: "presentation ppt",
  },
  agent_recommendation: null,
};

vi.mock("@/src/app/lib/catalog-api", () => ({
  fetchAiSearch: vi.fn(async () => aiSearch),
  fetchDirectory: vi.fn(async () => directory),
  fetchScenarios: vi.fn(async () => []),
}));

const mockedFetchAiSearch = vi.mocked(fetchAiSearch);
const mockedFetchDirectory = vi.mocked(fetchDirectory);
const mockedFetchScenarios = vi.mocked(fetchScenarios);
const mockedHomePage = vi.mocked(HomePage);
const mockedToolsPage = vi.mocked(ToolsPage);

describe("search route loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchAiSearch.mockResolvedValue(aiSearch);
    mockedFetchDirectory.mockResolvedValue(directory);
    mockedFetchScenarios.mockResolvedValue([]);
  });

  it("uses only /api/ai-search for the primary tools route payload in AI mode", async () => {
    render(await ToolsRoute({ searchParams: Promise.resolve({ mode: "ai", q: "做PPT", page_size: "24" }) }));

    expect(mockedFetchAiSearch).toHaveBeenCalledTimes(1);
    expect(mockedFetchAiSearch).toHaveBeenCalledWith("q=%E5%81%9APPT&page=1&page_size=24");
    expect(mockedFetchDirectory).not.toHaveBeenCalled();
    expect(mockedToolsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        directory,
        aiSearch,
        loadState: "idle",
      }),
      undefined,
    );
  });

  it("falls back to /api/tools only when AI search fails", async () => {
    mockedFetchAiSearch.mockRejectedValueOnce(new Error("api down"));

    render(await ToolsRoute({ searchParams: Promise.resolve({ mode: "ai", q: "做PPT", page_size: "24" }) }));

    expect(mockedFetchAiSearch).toHaveBeenCalledTimes(1);
    expect(mockedFetchDirectory).toHaveBeenCalledTimes(1);
    expect(mockedFetchDirectory).toHaveBeenCalledWith("q=%E5%81%9APPT&page=1&page_size=24");
  });

  it("does not request the primary homepage directory twice in AI mode", async () => {
    render(await HomeRoute({ searchParams: Promise.resolve({ mode: "ai", q: "做PPT" }) }));

    expect(mockedFetchAiSearch).toHaveBeenCalledTimes(1);
    expect(mockedFetchDirectory).toHaveBeenCalledTimes(2);
    expect(mockedFetchDirectory).toHaveBeenNthCalledWith(1, "view=hot&page=1&page_size=12");
    expect(mockedFetchDirectory).toHaveBeenNthCalledWith(2, "view=latest&page=1&page_size=12");
    expect(mockedHomePage).toHaveBeenCalledWith(
      expect.objectContaining({
        directory,
        aiPanel: aiSearch.ai_panel,
        aiMeta: aiSearch.meta,
      }),
      undefined,
    );
  });
});
