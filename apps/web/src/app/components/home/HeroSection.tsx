"use client";

import type { RefObject } from "react";
import { ArrowRight, CheckCircle2, Radar } from "lucide-react";
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
  title = "同一个任务，看看哪个 AI 真能做好",
  subtitle = "先看统一输入、原始输出、缺陷标注和免费/付费建议，再决定要不要试、要不要买。",
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
  const proofPoints = ["统一输入", "原始输出可复查", "缺陷和避坑前置", "免费/付费建议清楚"];

  return (
    <section className="home-light-shell relative -mt-[68px] min-h-screen overflow-hidden pt-[68px]">
      <HeroParticleScene query={query} active={active} />
      <div className="home-route-map pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="home-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-36" aria-hidden="true" />

      <div className="relative mx-auto grid w-full min-w-0 max-w-[1440px] gap-8 px-4 pb-12 pt-8 sm:px-6 md:pt-10 lg:min-h-[calc(100vh-68px)] lg:grid-cols-[minmax(0,57%)_minmax(380px,43%)] lg:px-8">
        <div className="flex min-h-[560px] min-w-0 flex-col justify-center py-6 lg:min-h-[640px]">
          <div className="home-kicker inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold motion-safe:animate-[agentReveal_360ms_ease-out_both]">
            <Radar className="h-3.5 w-3.5" />
            3 秒定位 · 第三方 AI 工具测评
          </div>
          <h1 className="home-title mt-6 max-w-3xl text-[clamp(2.65rem,6vw,5.4rem)] font-semibold leading-[1.04] tracking-normal motion-safe:animate-[agentReveal_420ms_ease-out_80ms_both]">
            {title}
          </h1>
          {subtitle ? (
            <p className="home-subtitle mt-5 max-w-2xl text-base leading-8 motion-safe:animate-[agentReveal_460ms_ease-out_160ms_both] md:text-lg">
              {subtitle}
            </p>
          ) : null}

          <SearchSection query={query} inputRef={inputRef} onQueryChange={onQueryChange} onSubmit={onSearchSubmit} />

          <div className="home-flow mt-4 flex flex-wrap items-center gap-2 text-sm motion-safe:animate-[agentReveal_520ms_ease-out_280ms_both]">
            <span className="home-flow-active font-semibold">输入任务</span>
            <ArrowRight className="home-flow-arrow h-4 w-4" />
            <span>拆解需求</span>
            <ArrowRight className="home-flow-arrow h-4 w-4" />
            <span>推荐工具 / 路线</span>
            <ArrowRight className="home-flow-arrow h-4 w-4" />
            <span>看实测结果</span>
          </div>

          <TaskEntryCards />
          <QuickTasks onTaskActivate={onQuickTaskActivate} onTaskClick={onQuickTaskClick} />

          <div className="mt-7 flex flex-wrap items-center gap-2 text-xs">
            {proofPoints.map((point) => (
              <span key={point} className="home-proof inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <CheckCircle2 className="home-proof-icon h-3.5 w-3.5" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 self-center">
          <TaskBreakdownPreview activeTask={activeQuickTask} onStart={onRadarStart} />
        </div>
      </div>
    </section>
  );
}
