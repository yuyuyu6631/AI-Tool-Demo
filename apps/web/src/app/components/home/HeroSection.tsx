"use client";

import type { RefObject } from "react";
import { ArrowRight } from "lucide-react";
import HeroParticleScene from "./HeroParticleScene";
import QuickTasks from "./QuickTasks";
import SearchSection from "./SearchSection";
import TaskEntryCards from "./TaskEntryCards";
import { type QuickTask } from "./home-data";

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
  onQuickTaskPress?: (task: QuickTask) => void;
  onRadarStart?: () => void;
}

export default function HeroSection({
  title = "同一个任务，看看哪个 AI 真能做好",
  subtitle,
  query,
  inputRef,
  activeQuickTaskId,
  onQueryChange,
  onSearchSubmit,
  onQuickTaskActivate,
  onQuickTaskClick,
  onQuickTaskPress = () => undefined,
}: HeroSectionProps) {
  void activeQuickTaskId;

  return (
    <section className="home-light-shell relative -mt-[68px] min-h-screen overflow-hidden pt-[68px]">
      <HeroParticleScene />
      <div className="home-hero-spotlight pointer-events-none absolute inset-x-0 top-[220px] mx-auto h-64 max-w-4xl" aria-hidden="true" />
      <div className="home-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-36" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 pb-12 pt-14 text-center sm:px-6 md:pt-20 lg:min-h-[calc(100vh-68px)] lg:justify-center lg:px-8">
        <h1 className="home-title max-w-4xl text-[clamp(3rem,6.2vw,5.5rem)] font-semibold leading-[1.05] tracking-normal motion-safe:animate-[agentReveal_420ms_ease-out_60ms_both]">
          {title}
        </h1>

        <p className="home-subtitle mt-5 text-base leading-8 motion-safe:animate-[agentReveal_460ms_ease-out_120ms_both] md:text-xl">
          {subtitle ? (
            subtitle
          ) : (
            <>
              <span className="dark:hidden">别试了再后悔——我们替你测好了</span>
              <span className="hidden dark:inline">我们替你把每个 AI 都试了一遍</span>
            </>
          )}
        </p>

        <SearchSection
          query={query}
          inputRef={inputRef}
          onQueryChange={onQueryChange}
          onSubmit={onSearchSubmit}
          placeholder="比如：帮我润色论文 / 做一份销售周报 / 看懂这张表格"
        />

        <div className="home-gold-line mt-3 hidden dark:block" aria-hidden="true" />

        <div className="home-flow mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-sm motion-safe:animate-[agentReveal_520ms_ease-out_240ms_both]">
          <span className="home-flow-step">
            <span>1</span>
            <b className="dark:hidden">说你要做什么</b>
            <b className="hidden dark:inline">描述你的任务</b>
          </span>
          <ArrowRight className="home-flow-arrow h-4 w-4" />
          <span className="home-flow-step">
            <span>2</span>
            <b className="dark:hidden">看真实对比结果</b>
            <b className="hidden dark:inline">看横向实测结果</b>
          </span>
          <ArrowRight className="home-flow-arrow h-4 w-4" />
          <span className="home-flow-step">
            <span>3</span>
            <b>直接用最好那个</b>
          </span>
        </div>

        <QuickTasks onTaskActivate={onQuickTaskActivate} onTaskClick={onQuickTaskClick} onTaskPress={onQuickTaskPress} />
        <TaskEntryCards />
      </div>
    </section>
  );
}
