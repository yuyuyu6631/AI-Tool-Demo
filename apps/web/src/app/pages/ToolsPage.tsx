"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GitBranch, RotateCcw, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import CatalogScrollRestorer from "../components/CatalogScrollRestorer";
import CompareToolsGrid from "../components/CompareToolsGrid";
import { Skeleton } from "../components/ui/skeleton";
import type { AiSearchResponse, ToolsDirectoryResponse } from "../lib/catalog-types";
import { buildToolsHref, derivePriceFacets } from "../lib/catalog-utils";
import { withPublicPath } from "../lib/public-path";
import { trackEvent } from "../lib/analytics";

const CATEGORY_LIMIT = 6;
const TAG_LIMIT = 8;

const DECISION_SHORTCUTS = [
  { id: "latest", label: "最新", hrefKey: "view", value: "latest" },
  { id: "hot", label: "最热", hrefKey: "view", value: "hot" },
  { id: "free", label: "免费优先", hrefKey: "price", value: "free" },
  { id: "subscription", label: "需要付费", hrefKey: "price", value: "subscription" },
] as const;

interface ToolsPageProps {
  directory: ToolsDirectoryResponse;
  aiSearch?: AiSearchResponse | null;
  state: {
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
  };
  loadState?: "idle" | "error" | "timeout";
}

function buildToolsPageHref(
  current: Record<string, string | undefined>,
  updates: Record<string, string | number | null | undefined>,
) {
  return withPublicPath(buildToolsHref(current, updates, "/tools"));
}

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [];

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const tokens: Array<number | "ellipsis"> = [];

  for (const page of sorted) {
    const last = tokens[tokens.length - 1];
    if (typeof last === "number" && page - last > 1) {
      tokens.push("ellipsis");
    }
    tokens.push(page);
  }

  return tokens;
}

function AgentRecommendationSummary({ aiSearch }: { aiSearch?: AiSearchResponse | null }) {
  const agent = aiSearch?.agent_recommendation;
  if (!agent) return null;
  const topPlan = agent.toolPlan[0];
  const confidenceLabel = agent.confidence === "high" ? "高置信" : agent.confidence === "low" ? "低置信" : "中置信";

  return (
    <section data-testid="tools-agent-recommendation" className="panel-base mt-6 overflow-hidden rounded-[28px] border border-slate-900 bg-slate-950 p-5 text-white md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100">
            <GitBranch className="h-3.5 w-3.5" />
            Agent 推荐报告 · {confidenceLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{agent.intent.task}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{agent.intent.summary}</p>
          {agent.intent.constraints.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.intent.constraints.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {topPlan ? (
          <div className="rounded-2xl border border-[#f6c768]/35 bg-[#f6c768]/10 p-4 lg:w-[320px]">
            <p className="text-xs font-semibold text-[#ffe6a6]">主推荐</p>
            <p className="mt-2 text-lg font-semibold">{topPlan.tool_name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{topPlan.fit_reason}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {agent.trace.map((step, index) => (
          <div key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-300/15">{index + 1}</span>
              {step.title}
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>

      {agent.toolPlan.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {agent.toolPlan.slice(0, 3).map((item) => (
            <div key={item.tool_slug} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{item.tool_name}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{item.role}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.fit_reason}</p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-100">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f6c768]" />
                {item.limitation_risk}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ToolsPage({ directory, aiSearch, state, loadState = "idle" }: ToolsPageProps) {
  const [aiPending, setAiPending] = useState(false);
  const activeMode = state.mode === "ai" ? "ai" : "search";
  const activeView = state.view || "hot";
  const activeSort = state.sort || "featured";
  const priceFacets = directory.priceFacets ?? derivePriceFacets(directory.items);
  const accessFacets = directory.accessFacets ?? [];
  const priceRangeFacets = directory.priceRangeFacets ?? [];
  const visibleCategories = directory.categories.slice(0, CATEGORY_LIMIT);
  const overflowCategories = directory.categories.slice(CATEGORY_LIMIT);
  const visibleTags = directory.tags.slice(0, TAG_LIMIT);
  const overflowTags = directory.tags.slice(TAG_LIMIT);
  const selectedCategory = directory.categories.find((item) => item.slug === state.category);
  const selectedTag = directory.tags.find((item) => item.slug === state.tag);
  const selectedPrice = priceFacets.find((item) => item.slug === state.price);
  const selectedPriceRange = priceRangeFacets.find((item) => item.slug === state.priceRange);
  const selectedAccess = (state.access || "")
    .split(",")
    .filter(Boolean)
    .map((slug) => accessFacets.find((item) => item.slug === slug)?.label)
    .filter((label): label is string => Boolean(label));
  const showEmpty = directory.items.length === 0;
  const current = {
    mode: activeMode,
    aiFocus: state.aiFocus,
    q: state.q,
    category: state.category,
    tag: state.tag,
    price: state.price,
    access: state.access,
    price_range: state.priceRange,
    sort: state.sort,
    view: state.view,
    page: state.page,
    page_size: state.pageSize,
  };
  const sourceTitleMap: Record<string, string> = {
    home_hot: "首页热门工具",
    home_latest: "首页最新工具",
    home_category: "首页分类工具",
    home_search: "首页搜索结果",
  };
  const pageTitle = state.q ? "搜索结果" : sourceTitleMap[state.source || ""] || "工具目录";
  const currentPage = Number(state.page || directory.page || 1);
  const totalPages = Math.max(1, Math.ceil(directory.total / Math.max(1, directory.pageSize || 9)));
  const pagination = buildPagination(currentPage, totalPages);
  const currentRoute = buildToolsPageHref(current, {});
  const isFiltered = Boolean(
    state.q || state.category || state.tag || state.price || state.access || state.priceRange || activeView !== "hot" || activeSort !== "featured" || activeMode !== "search",
  );
  const startAiPending = () => {
    if (activeMode === "ai") {
      setAiPending(true);
    }
  };

  useEffect(() => {
    setAiPending(false);
  }, [state.mode, state.aiFocus, state.q, state.category, state.tag, state.price, state.access, state.priceRange, state.sort, state.view, state.page, state.pageSize]);

  return (
    <div className="page-shell">
      <CatalogScrollRestorer />
      <Header currentPath="/tools" currentRoute={currentRoute} />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "工具目录" }]} />

          <section className="panel-base rounded-[32px] p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">工具目录</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  这里不是把工具堆给你，而是帮你按需求、分类、标签和价格更快缩小范围，再进入详情页判断是否适合。
                </p>
              </div>

              <form
                action={withPublicPath("/tools")}
                method="get"
                className="w-full rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-3 shadow-sm lg:max-w-[520px]"
                onSubmit={() => {
                  if (activeMode === "ai") {
                    setAiPending(true);
                  }
                }}
              >
                <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <Link
                    href={buildToolsPageHref(current, { mode: "search", page: 1 })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeMode === "search"
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    onClick={() => trackEvent("home_mode_switch", { mode: "search", source: "tools" })}
                  >
                    直接搜索
                  </Link>
                  <Link
                    href={buildToolsPageHref(current, { mode: "ai", page: 1 })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeMode === "ai"
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    onClick={() => {
                      setAiPending(true);
                      trackEvent("home_mode_switch", { mode: "ai", source: "tools" });
                    }}
                  >
                    AI 帮找
                  </Link>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="tools-search"
                      type="search"
                      name="q"
                      defaultValue={state.q || ""}
                      placeholder="想写文案、做海报、写代码？告诉我你的任务。"
                      data-global-search-target="tools"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(148,163,184,0.16)]"
                    />
                    <input type="hidden" name="mode" value={activeMode} />
                    {state.view ? <input type="hidden" name="view" value={state.view} /> : null}
                    {state.category ? <input type="hidden" name="category" value={state.category} /> : null}
                    {state.tag ? <input type="hidden" name="tag" value={state.tag} /> : null}
                    {state.price ? <input type="hidden" name="price" value={state.price} /> : null}
                    {state.access ? <input type="hidden" name="access" value={state.access} /> : null}
                    {state.priceRange ? <input type="hidden" name="price_range" value={state.priceRange} /> : null}
                    {state.sort ? <input type="hidden" name="sort" value={state.sort} /> : null}
                    {state.pageSize ? <input type="hidden" name="page_size" value={state.pageSize} /> : null}
                  </div>
                  <button
                    type="submit"
                    className="btn-primary inline-flex h-11 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold sm:w-28"
                    disabled={activeMode === "ai" && aiPending}
                  >
                    {activeMode === "ai" ? (aiPending ? "正在匹配..." : "开始推荐") : "开始筛选"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {DECISION_SHORTCUTS.map((item) => (
                    <Link
                      key={item.id}
                      href={buildToolsPageHref(current, { [item.hrefKey]: item.value, page: 1 })}
                      className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                        (item.hrefKey === "view" ? activeView === item.value : state.price === item.value)
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                      }`}
                      onClick={startAiPending}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {directory.presets.map((preset) => (
                <Link
                  key={preset.id}
                  href={buildToolsPageHref(current, {
                    view: preset.id,
                    page: 1,
                    category: null,
                    tag: null,
                  })}
                  className={`filter-chip rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeView === preset.id
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "border border-white/45 bg-white/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  {preset.label}
                </Link>
              ))}
            </div>
          </section>

          {activeMode === "ai" && aiPending ? (
            <section role="status" aria-live="polite" className="panel-base mt-6 rounded-[28px] border border-sky-200/80 bg-sky-50/70 p-5 md:p-6">
              <p className="text-sm font-semibold text-sky-900">AI 正在匹配工具，请稍候...</p>
              <p className="mt-1 text-xs text-sky-700">正在分析你的任务、价格偏好和访问条件，马上返回结果。</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Skeleton className="h-20 rounded-2xl bg-white/80" />
                <Skeleton className="h-20 rounded-2xl bg-white/80" />
                <Skeleton className="h-20 rounded-2xl bg-white/80" />
              </div>
            </section>
          ) : null}

          <AgentRecommendationSummary aiSearch={aiSearch} />

          <section className="mt-6 grid items-start gap-6 xl:grid-cols-[288px_minmax(0,1fr)]">
            <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
              <div className="panel-base rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4" />
                  决策筛选
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">快速入口</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DECISION_SHORTCUTS.map((item) => (
                      <Link
                        key={`sidebar-${item.id}`}
                        href={buildToolsPageHref(current, { [item.hrefKey]: item.value, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          (item.hrefKey === "view" ? activeView === item.value : state.price === item.value)
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                        onClick={startAiPending}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">排序</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { id: "featured", label: "最热" },
                      { id: "latest", label: "最新" },
                      { id: "name", label: "名称" },
                    ].map((sortOption) => (
                      <Link
                        key={sortOption.id}
                        href={buildToolsPageHref(current, { sort: sortOption.id, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          activeSort === sortOption.id
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {sortOption.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">分类</p>
                    {state.category ? (
                      <Link href={buildToolsPageHref(current, { category: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                        清除分类
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {visibleCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={buildToolsPageHref(current, { category: category.slug, page: 1 })}
                        className={`aside-item flex items-center justify-between rounded-2xl px-3 py-2 text-sm ${
                          state.category === category.slug ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <span>{category.label}</span>
                        <span className="text-xs opacity-70">{category.count}</span>
                      </Link>
                    ))}
                    {overflowCategories.length > 0 ? (
                      <details className="rounded-2xl bg-white/60 p-3">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">查看更多分类</summary>
                        <div className="mt-3 space-y-2">
                          {overflowCategories.map((category) => (
                            <Link
                              key={category.slug}
                              href={buildToolsPageHref(current, { category: category.slug, page: 1 })}
                              className="aside-item flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white"
                            >
                              <span>{category.label}</span>
                              <span className="text-xs text-slate-500">{category.count}</span>
                            </Link>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </div>

                {priceFacets.length > 0 ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">价格</p>
                      {state.price ? (
                        <Link href={buildToolsPageHref(current, { price: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                          清除价格
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {priceFacets.map((price) => (
                        <Link
                          key={price.slug}
                          href={buildToolsPageHref(current, { price: price.slug, page: 1 })}
                          className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                            state.price === price.slug
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                              : "bg-white/70 text-slate-700 hover:bg-white"
                          }`}
                        >
                          {price.label} ({price.count})
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {priceRangeFacets.length > 0 ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">价格区间</p>
                      {state.priceRange ? (
                        <Link href={buildToolsPageHref(current, { price_range: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                          清除区间
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {priceRangeFacets.map((priceRange) => (
                        <Link
                          key={priceRange.slug}
                          href={buildToolsPageHref(current, { price_range: priceRange.slug, page: 1 })}
                          className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                            state.priceRange === priceRange.slug
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                              : "bg-white/70 text-slate-700 hover:bg-white"
                          }`}
                        >
                          {priceRange.label} ({priceRange.count})
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {accessFacets.length > 0 ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">访问条件</p>
                      {state.access ? (
                        <Link href={buildToolsPageHref(current, { access: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                          清除条件
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {accessFacets.map((accessFacet) => {
                        const active = (state.access || "").split(",").includes(accessFacet.slug);
                        const values = new Set((state.access || "").split(",").filter(Boolean));
                        if (active) values.delete(accessFacet.slug);
                        else values.add(accessFacet.slug);
                        return (
                          <Link
                            key={accessFacet.slug}
                            href={buildToolsPageHref(current, { access: Array.from(values).sort().join(",") || null, page: 1 })}
                            className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                              active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "bg-white/70 text-slate-700 hover:bg-white"
                            }`}
                          >
                            {accessFacet.label} ({accessFacet.count})
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">标签</p>
                    {state.tag ? (
                      <Link href={buildToolsPageHref(current, { tag: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                        清除标签
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={buildToolsPageHref(current, { tag: tag.slug, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          state.tag === tag.slug
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {tag.label}
                      </Link>
                    ))}
                  </div>
                  {overflowTags.length > 0 ? (
                    <details className="mt-3 rounded-2xl bg-white/60 p-3">
                      <summary className="cursor-pointer text-sm font-medium text-slate-700">
                        更多标签 ({overflowTags.length})
                      </summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {overflowTags.map((tag) => (
                          <Link
                            key={tag.slug}
                            href={buildToolsPageHref(current, { tag: tag.slug, page: 1 })}
                            className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                              state.tag === tag.slug
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                : "bg-white/70 text-slate-700 hover:bg-white"
                            }`}
                          >
                            {tag.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>

                {isFiltered ? (
                  <div className="mt-6">
                    <Link href={withPublicPath("/tools?mode=search")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline">
                      <RotateCcw className="h-4 w-4" />
                      重置筛选
                    </Link>
                  </div>
                ) : null}
              </div>
            </aside>

            <div>
              {loadState !== "idle" ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-lg font-semibold text-slate-900">{loadState === "timeout" ? "目录加载超时" : "目录加载失败"}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">当前未能完整获取工具目录数据。你可以刷新重试，或稍后再访问。</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={buildToolsPageHref(current, {})} className="btn-primary rounded-full px-4 py-2 text-sm">
                      重新加载
                    </Link>
                    <Link href={withPublicPath("/tools?mode=search")} className="btn-secondary rounded-full px-4 py-2 text-sm">
                      返回目录
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="panel-base mb-4 rounded-[24px] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{`结果数：${directory.total}`}</span>
                    <span>{`当前页：${currentPage} / ${totalPages}`}</span>
                    <span>{`模式：${activeMode === "ai" ? "AI 帮找" : "直接搜索"}`}</span>
                    {selectedCategory ? <span>{`分类：${selectedCategory.label}`}</span> : null}
                    {selectedTag ? <span>{`标签：${selectedTag.label}`}</span> : null}
                    {selectedPrice ? <span>{`价格：${selectedPrice.label}`}</span> : null}
                    {selectedPriceRange ? <span>{`价格区间：${selectedPriceRange.label}`}</span> : null}
                    {selectedAccess.length > 0 ? <span>{`访问条件：${selectedAccess.join(" / ")}`}</span> : null}
                    {state.q ? <span>{`搜索：${state.q}`}</span> : null}
                  </div>
                  {!showEmpty && totalPages > 1 ? <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">列表 / 详情 / 返回</div> : null}
                </div>
              </div>

              {showEmpty ? (
                <div className="panel-base rounded-[28px] p-8 text-center">
                  <h2 className="text-xl font-semibold text-slate-900">暂无匹配工具</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">当前筛选条件下没有找到结果。你可以换一个关键词，或清除分类、价格和标签后再试。</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link href={withPublicPath("/tools?mode=search")} className="btn-primary rounded-full px-5 py-3 text-sm">
                      重置筛选
                    </Link>
                    <Link href={withPublicPath("/tools?view=hot&mode=search")} className="btn-secondary rounded-full px-5 py-3 text-sm">
                      返回最热
                    </Link>
                  </div>
                </div>
              ) : (
                <CompareToolsGrid
                  items={directory.items}
                  rememberDetailNavigation
                  onToolDetailClick={(tool) => {
                    if (activeMode !== "ai") return;
                    trackEvent("tools_ai_to_detail_click", {
                      mode: activeMode,
                      slug: tool.slug,
                      query: state.q || "",
                    });
                  }}
                />
              )}

              {!showEmpty && totalPages > 1 ? (
                <nav aria-label="分页导航" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href={buildToolsPageHref(current, { page: Math.max(1, currentPage - 1) })}
                    aria-disabled={currentPage <= 1}
                    className={`pagination-chip inline-flex min-w-10 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Link>
                  {pagination.map((token, index) =>
                    token === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-400">
                        ...
                      </span>
                    ) : (
                      <Link
                        key={token}
                        href={buildToolsPageHref(current, { page: token })}
                        aria-current={token === currentPage ? "page" : undefined}
                        className={`pagination-chip inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                          token === currentPage ? "is-active bg-slate-900 text-white" : ""
                        }`}
                      >
                        {token}
                      </Link>
                    ),
                  )}
                  <Link
                    href={buildToolsPageHref(current, { page: Math.min(totalPages, currentPage + 1) })}
                    aria-disabled={currentPage >= totalPages}
                    className={`pagination-chip inline-flex min-w-10 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </nav>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
