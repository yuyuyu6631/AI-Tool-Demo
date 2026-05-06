"use client";

import { ArrowRight } from "lucide-react";
import { theme } from "../../../theme/theme";
import type { QuickTask } from "./home-data";

const DEFAULT_TASK_PREVIEW = {
  id: "default",
  title: "首页只负责帮你选入口",
  body: "有明确任务就先去搜索拆解，想省钱就看免费额度和活动，已经知道工具类型再进工具库。别在首页靠滑动猜下一步。",
  next: "",
};

interface TaskBreakdownPreviewProps {
  activeTask: QuickTask | null;
  onStart: () => void;
}

export default function TaskBreakdownPreview({ activeTask, onStart }: TaskBreakdownPreviewProps) {
  const preview = activeTask ?? DEFAULT_TASK_PREVIEW;
  const steps = activeTask
    ? ["先确认这件事最后要交付什么", "拆出最容易卡住的环节", "再看适合进入哪些场景"]
    : ["说清楚要做什么", "看这个任务能拆成哪几步", "再进入工具推荐和避坑"];

  return (
    <section
      data-testid="home-signal-radar"
      className="relative overflow-hidden rounded-[28px] border border-sky-100/16 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(56,189,248,0.10),0_34px_110px_rgba(0,0,0,0.48),0_0_54px_rgba(14,165,233,0.16)] backdrop-blur-2xl motion-safe:animate-[agentReveal_560ms_ease-out_180ms_both]"
      style={{ backgroundColor: `${theme.colors.home.radarPanel}94` }}
    >
      <div className="pointer-events-none absolute left-[-90px] top-[-90px] h-56 w-56 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-110px] right-[-80px] h-60 w-60 rounded-full blur-3xl" style={{ backgroundColor: `${theme.colors.home.gold}17` }} />
      <div className="pointer-events-none absolute right-8 top-8 h-44 w-44 rounded-full border border-sky-200/10" />
      <div className="pointer-events-none absolute right-16 top-16 h-28 w-28 rounded-full border" style={{ borderColor: `${theme.colors.home.gold}1f` }} />
      <div className="pointer-events-none absolute right-24 top-24 h-12 w-12 rounded-full bg-sky-300/10 shadow-[0_0_48px_rgba(56,189,248,0.28)]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p
            className="inline-flex rounded border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: `${theme.colors.home.gold}47`, backgroundColor: `${theme.colors.home.gold}1a`, color: theme.colors.home.goldText }}
          >
            入口雷达
          </p>
          <span className="rounded-full border border-sky-200/14 bg-sky-200/8 px-3 py-1 text-[11px] font-semibold text-sky-100/72">
            LIVE
          </span>
        </div>

        <div key={preview.id} className="motion-safe:animate-[agentReveal_360ms_ease-out_both]">
          <h2 className="max-w-[420px] text-2xl font-semibold leading-tight text-slate-50 md:text-3xl">{preview.title}</h2>
          <p className="mt-4 max-w-[470px] text-sm leading-7 text-sky-50/72">{preview.body}</p>
          {activeTask ? (
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: `${theme.colors.home.gold}2e`, backgroundColor: `${theme.colors.home.gold}14` }}>
              <p className="text-xs font-semibold text-slate-400">下一步可以看</p>
              <p className="mt-1 text-sm leading-6" style={{ color: theme.colors.home.goldText }}>{activeTask.next}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-2.5">
          {steps.map((step, index) => (
            <div
              key={`${preview.id}-${step}`}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 motion-safe:animate-[agentReveal_420ms_ease-out_both]"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <span className="mt-0.5 min-w-8 text-xs font-semibold text-sky-200">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-6 text-slate-200">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            ["今日可薅", "免费额度"],
            ["热门场景", "论文 / PPT"],
            ["新测评", "避坑结论"],
            ["国内可用", "优先标注"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-3">
              <p className="text-[11px] font-semibold text-sky-100/56">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-200/25 bg-sky-200/10 px-4 py-3 text-sm font-semibold text-sky-50 shadow-[0_0_24px_rgba(14,165,233,0.12)] transition duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-300/45"
        >
          聚焦任务输入
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
