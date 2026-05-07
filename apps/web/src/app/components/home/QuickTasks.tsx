"use client";

import Link from "next/link";
import { withPublicPath } from "../../lib/public-path";
import { QUICK_TASKS, type QuickTask } from "./home-data";

interface QuickTasksProps {
  onTaskActivate: (taskId: QuickTask["id"]) => void;
  onTaskClick: (taskId: QuickTask["id"]) => void;
}

export default function QuickTasks({ onTaskActivate, onTaskClick }: QuickTasksProps) {
  return (
    <div aria-label="快捷任务入口" className="mt-5 flex max-w-3xl flex-wrap gap-2 motion-safe:animate-[agentReveal_520ms_ease-out_420ms_both]">
      <span className="home-quick-label inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold">
        今日热门任务
      </span>
      {QUICK_TASKS.map((task, index) => (
        <Link
          key={task.id}
          href={withPublicPath(task.href)}
          onMouseEnter={() => onTaskActivate(task.id)}
          onFocus={() => onTaskActivate(task.id)}
          onClick={() => onTaskClick(task.id)}
          className="home-quick-chip inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium backdrop-blur transition duration-200 hover:-translate-y-0.5 focus:outline-none"
          style={{ animationDelay: `${360 + index * 45}ms` }}
        >
          <span className="home-quick-dot h-1.5 w-1.5 rounded-full" />
          {task.label}
        </Link>
      ))}
    </div>
  );
}
