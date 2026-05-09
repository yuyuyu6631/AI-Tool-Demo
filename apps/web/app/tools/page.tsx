import ToolsPage from "@/src/app/pages/ToolsPage";
import { fetchAiSearch, fetchDirectory } from "@/src/app/lib/catalog-api";
import type { AiSearchResponse, ToolsDirectoryResponse } from "@/src/app/lib/catalog-types";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 24;

const EMPTY_DIRECTORY: ToolsDirectoryResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
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

interface ToolsRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface ToolsPageState {
  mode?: string;
  aiFocus?: string;
  q?: string;
  category?: string;
  tag?: string;
  price?: string;
  access?: string;
  priceRange?: string;
  sort?: string;
  view?: string;
  page?: string;
  pageSize?: string;
  source?: string;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

function readPositiveIntString(value: string | string[] | undefined, max?: number) {
  const rawValue = readValue(value);
  if (!rawValue) return undefined;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return String(max ? Math.min(parsed, max) : parsed);
}

function buildDirectoryQuery(state: ToolsPageState) {
  const params = new URLSearchParams();
  const allowedKeys: Array<keyof ToolsPageState> = ["q", "category", "tag", "price", "access", "sort", "view", "page"];

  for (const key of allowedKeys) {
    const value = state[key];
    if (!value) continue;
    params.set(key, value);
  }

  if (state.priceRange) {
    params.set("price_range", state.priceRange);
  }

  if (!params.has("page")) {
    params.set("page", "1");
  }

  params.set("page_size", state.pageSize || String(DEFAULT_PAGE_SIZE));
  return params.toString();
}

function resolveLoadState(error: unknown): "error" | "timeout" {
  if (error instanceof Error && /timeout/i.test(error.name)) {
    return "timeout";
  }
  return "error";
}

async function loadToolsDirectory(
  queryString: string,
  shouldUseAiSearch: boolean,
): Promise<{ directory: ToolsDirectoryResponse; aiSearch: AiSearchResponse | null; loadState: "idle" | "error" | "timeout" }> {
  if (shouldUseAiSearch) {
    try {
      const aiSearch = await fetchAiSearch(queryString);
      return { directory: aiSearch.directory, aiSearch, loadState: "idle" };
    } catch {
      // Fall back to the regular catalog only when the AI aggregation path fails.
    }
  }

  try {
    return { directory: await fetchDirectory(queryString), aiSearch: null, loadState: "idle" };
  } catch (error) {
    return { directory: EMPTY_DIRECTORY, aiSearch: null, loadState: resolveLoadState(error) };
  }
}

export default async function Page({ searchParams }: ToolsRouteProps) {
  const params = await searchParams;
  const state: ToolsPageState = {
    mode: readValue(params.mode),
    aiFocus: readValue(params.ai_focus) ?? readValue(params.aiFocus),
    q: readValue(params.q),
    category: readValue(params.category),
    tag: readValue(params.tag),
    price: readValue(params.price),
    access: readValue(params.access),
    priceRange: readValue(params.price_range),
    sort: readValue(params.sort),
    view: readValue(params.view),
    page: readPositiveIntString(params.page),
    pageSize: readPositiveIntString(params.page_size, DEFAULT_PAGE_SIZE),
    source: readValue(params.source),
  };

  const queryString = buildDirectoryQuery(state);
  const shouldUseAiSearch = state.mode === "ai" && Boolean(state.q?.trim());
  const { directory, aiSearch, loadState } = await loadToolsDirectory(queryString, shouldUseAiSearch);

  return <ToolsPage directory={directory} aiSearch={aiSearch} state={state} loadState={loadState} />;
}
