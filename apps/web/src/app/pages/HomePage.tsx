"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import CatalogScrollRestorer from "../components/CatalogScrollRestorer";
import HeroSection from "../components/home/HeroSection";
import { QUICK_TASKS, type QuickTask } from "../components/home/home-data";
import type { AgentRecommendation, AiPanel, AiSearchMeta, ScenarioSummary, ToolSummary, ToolsDirectoryResponse } from "../lib/catalog-types";
import { buildToolsHref } from "../lib/catalog-utils";
import { trackEvent } from "../lib/analytics";
import { withPublicPath } from "../lib/public-path";

const HOME_PRESERVE_SCROLL_KEY = "home:preserve-scroll";

interface HomePageProps {
  directory: ToolsDirectoryResponse;
  hotTools: ToolSummary[];
  latestTools: ToolSummary[];
  scenarios: ScenarioSummary[];
  state: {
    mode?: string;
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    access?: string;
    priceRange?: string;
    sort?: string;
    view?: string;
    tab?: string;
    page?: string;
    source?: string;
  };
  aiPanel?: AiPanel | null;
  aiMeta?: AiSearchMeta | null;
  agentRecommendation?: AgentRecommendation | null;
}

export default function HomePage({ state }: HomePageProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(state.q || "");
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [activeQuickTaskId, setActiveQuickTaskId] = useState<QuickTask["id"] | null>(null);

  const currentRoute = buildToolsHref({ ...state }, {});
  const hasSemanticResult = Boolean(state.mode === "ai" && state.q);

  useEffect(() => setQuery(state.q || ""), [state.q]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(HOME_PRESERVE_SCROLL_KEY);
    if (!stored) return;
    window.sessionStorage.removeItem(HOME_PRESERVE_SCROLL_KEY);
    const top = Number.parseInt(stored, 10);
    if (!Number.isFinite(top)) return;
    window.requestAnimationFrame(() => window.scrollTo({ top, behavior: "auto" }));
    window.setTimeout(() => window.scrollTo({ top, behavior: "auto" }), 120);
    window.setTimeout(() => window.scrollTo({ top, behavior: "auto" }), 500);
  }, [currentRoute]);

  useEffect(() => {
    setPendingLabel(null);
  }, [currentRoute]);

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    const href = trimmed ? withPublicPath(`/tools?mode=ai&q=${encodeURIComponent(trimmed)}&page=1&page_size=24`) : withPublicPath("/tools?mode=ai");
    trackEvent("home_semantic_search", { has_query: Boolean(trimmed), query_length: trimmed.length });
    if (!trimmed) {
      searchInputRef.current?.focus();
      return;
    }

    setPendingLabel(`正在进入任务搜索：${trimmed}`);
    router.push(href);
  };

  const focusTaskInput = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  };

  const activateQuickTask = (taskId: QuickTask["id"]) => {
    setActiveQuickTaskId(taskId);
  };

  const trackQuickTaskClick = (taskId: QuickTask["id"]) => {
    if (!QUICK_TASKS.some((task) => task.id === taskId)) return;
    trackEvent("home_quick_task_click", { task: taskId });
  };

  return (
    <div className="home-light-shell min-h-screen bg-[var(--home-bg)]">
      <CatalogScrollRestorer />
      <Header currentPath="/" currentRoute={currentRoute} />

      <main aria-busy={pendingLabel ? "true" : "false"} className="bg-[var(--home-bg)] pb-16">
        <HeroSection
          query={query}
          inputRef={searchInputRef}
          active={Boolean(pendingLabel || hasSemanticResult)}
          activeQuickTaskId={activeQuickTaskId}
          onQueryChange={setQuery}
          onSearchSubmit={submitSearch}
          onQuickTaskActivate={activateQuickTask}
          onQuickTaskClick={trackQuickTaskClick}
          onRadarStart={focusTaskInput}
        />
      </main>
    </div>
  );
}
