"use client";

import Link from "next/link";
import { ArrowRight, Compass, Gift, Library } from "lucide-react";
import { theme } from "../../../theme/theme";
import { withPublicPath } from "../../lib/public-path";
import { HOME_ENTRY_CARDS } from "./home-data";

export default function TaskEntryCards() {
  return (
    <div className="mt-5 grid max-w-3xl gap-3 motion-safe:animate-[agentReveal_520ms_ease-out_300ms_both] md:grid-cols-3">
      {HOME_ENTRY_CARDS.map((entry, index) => {
        const Icon = index === 0 ? Compass : index === 1 ? Gift : Library;
        const isDeal = index === 1;
        return (
          <Link
            key={entry.href}
            href={withPublicPath(entry.href)}
            className={`group relative min-h-[168px] overflow-hidden rounded-[22px] border p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 ${
              index === 0
                ? "border-sky-200/30 bg-sky-200/[0.095] hover:border-sky-200/55"
                : index === 1
                  ? "hover:border-amber-200/55"
                  : "border-white/12 bg-white/[0.052] hover:border-white/25"
            }`}
            style={isDeal ? { borderColor: `${theme.colors.home.gold}47`, backgroundColor: `${theme.colors.home.gold}13` } : undefined}
          >
            <div className="pointer-events-none absolute right-[-28px] top-[-28px] h-24 w-24 rounded-full bg-white/8 blur-2xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[11px] font-semibold" style={{ color: theme.colors.home.goldText }}>
                  {entry.eyebrow}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8 text-sky-100">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{entry.title}</h2>
              <p className="mt-2 text-sm leading-6 text-sky-50/66">{entry.body}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-sky-100 transition group-hover:text-amber-100">
                进入
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
