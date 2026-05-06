"use client";

import type { RefObject } from "react";
import { Radar } from "lucide-react";
import { theme } from "../../../theme/theme";
import HeroParticleScene from "./HeroParticleScene";
import QuickTasks from "./QuickTasks";
import SearchSection from "./SearchSection";
import TaskBreakdownPreview from "./TaskBreakdownPreview";
import TaskEntryCards from "./TaskEntryCards";
import { QUICK_TASKS, type QuickTask } from "./home-data";

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  active?: boolean;
  activeQuickTaskId: QuickTask["id"] | null;
  onQueryChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onQuickTaskActivate: (taskId: QuickTask["id"]) => void;
  onQuickTaskClick: (taskId: QuickTask["id"]) => void;
  onRadarStart: () => void;
}

export default function HeroSection({
  title = "3 秒找到能用的 AI 工具",
  subtitle = "说任务、看福利、逛工具库。别在一堆工具名里硬猜，先选你现在最想走的路。",
  query,
  inputRef,
  active = false,
  activeQuickTaskId,
  onQueryChange,
  onSearchSubmit,
  onQuickTaskActivate,
  onQuickTaskClick,
  onRadarStart,
}: HeroSectionProps) {
  const activeQuickTask = QUICK_TASKS.find((task) => task.id === activeQuickTaskId) ?? null;
  const heroOverlay = `radial-gradient(circle at 24% 22%, rgba(14,165,233,0.18), transparent 26%), radial-gradient(circle at 78% 42%, rgba(246,199,104,0.08), transparent 22%), linear-gradient(180deg, rgba(2,6,23,0.24) 0%, rgba(2,5,11,0.86) 68%, ${theme.colors.home.bg} 100%)`;

  return (
    <section className="relative -mt-[68px] min-h-screen overflow-hidden pt-[68px] text-white" style={{ backgroundColor: theme.colors.home.bg }}>
      <HeroParticleScene query={query} active={active} />
      <div className="absolute inset-0" style={{ backgroundImage: heroOverlay }} />
      <div className="absolute inset-x-0 bottom-0 h-32" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${theme.colors.home.bg})` }} />
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.colors.home.gold}73, transparent)` }} />
      <div className="relative mx-auto grid w-full min-w-0 max-w-[1440px] gap-6 px-4 py-6 sm:px-6 md:py-7 lg:min-h-[calc(100vh-68px)] lg:grid-cols-[minmax(0,58%)_minmax(360px,42%)] lg:px-8">
        <div className="flex min-h-[520px] min-w-0 flex-col justify-center py-2 lg:min-h-[620px]">
          <div className="inline-flex w-fit items-center gap-2 rounded border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold text-sky-100 shadow-[0_0_30px_rgba(14,165,233,0.18)] motion-safe:animate-[agentReveal_360ms_ease-out_both]">
            <Radar className="h-3.5 w-3.5" />
            3 秒定位 · 第三方 AI 工具测评
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-50 [text-shadow:0_0_32px_rgba(56,189,248,0.18)] motion-safe:animate-[agentReveal_420ms_ease-out_80ms_both] md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-sky-50/72 motion-safe:animate-[agentReveal_460ms_ease-out_160ms_both]">
              {subtitle}
            </p>
          ) : null}

          <SearchSection query={query} inputRef={inputRef} onQueryChange={onQueryChange} onSubmit={onSearchSubmit} />
          <TaskEntryCards />
          <QuickTasks onTaskActivate={onQuickTaskActivate} onTaskClick={onQuickTaskClick} />

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-sky-50/48">
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">不在首页堆工具详情</span>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">先分流，再推荐</span>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">测评与福利进入独立页面</span>
          </div>
        </div>

        <div className="min-w-0 self-center">
          <TaskBreakdownPreview activeTask={activeQuickTask} onStart={onRadarStart} />
        </div>
      </div>
    </section>
  );
}
