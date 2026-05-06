"use client";

import Link from "next/link";
import { theme } from "../../../theme/theme";
import { withPublicPath } from "../../lib/public-path";
import { QUICK_TASKS, type QuickTask } from "./home-data";

interface QuickTasksProps {
  onTaskActivate: (taskId: QuickTask["id"]) => void;
  onTaskClick: (taskId: QuickTask["id"]) => void;
}

export default function QuickTasks({ onTaskActivate, onTaskClick }: QuickTasksProps) {
  return (
    <div aria-label="快捷任务入口" className="mt-4 flex max-w-2xl flex-wrap gap-2 motion-safe:animate-[agentReveal_520ms_ease-out_420ms_both]">
      <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-sky-100/70">
        高频任务
      </span>
      {QUICK_TASKS.map((task, index) => (
        <Link
          key={task.id}
          href={withPublicPath(task.href)}
          onMouseEnter={() => onTaskActivate(task.id)}
          onFocus={() => onTaskActivate(task.id)}
          onClick={() => onTaskClick(task.id)}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-100/16 px-3 py-2 text-sm font-medium text-slate-200 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-300/45"
          style={{ animationDelay: `${360 + index * 45}ms`, backgroundColor: `${theme.colors.home.panel}9e` }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.colors.home.gold, boxShadow: `0 0 12px ${theme.colors.home.gold}b8` }}
          />
          {task.label}
        </Link>
      ))}
    </div>
  );
}
