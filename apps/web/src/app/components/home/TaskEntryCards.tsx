"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Gift, Library } from "lucide-react";
import { withPublicPath } from "../../lib/public-path";
import { HOME_ENTRY_CARDS } from "./home-data";

export default function TaskEntryCards() {
  return (
    <div className="mt-8 grid max-w-4xl gap-3 motion-safe:animate-[agentReveal_520ms_ease-out_320ms_both] lg:grid-cols-3">
      {HOME_ENTRY_CARDS.map((entry, index) => {
        const Icon = index === 0 ? BadgeCheck : index === 1 ? Gift : Library;
        const tone = index === 0 ? "home-entry-card--tests" : index === 1 ? "home-entry-card--deals" : "home-entry-card--library";
        return (
          <Link
            key={entry.href}
            href={withPublicPath(entry.href)}
            className={`home-entry-card group relative overflow-hidden rounded-[22px] border p-4 text-left backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 ${tone}`}
          >
            <div className="relative flex min-h-[142px] flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="home-entry-eyebrow rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  {entry.eyebrow}
                </span>
                <span className="home-entry-icon grid h-9 w-9 place-items-center rounded-full">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h2 className="home-entry-title mt-4 text-2xl font-semibold tracking-normal">{entry.title}</h2>
              <p className="home-entry-body mt-2 text-sm leading-6">{entry.body}</p>
              <span className="home-entry-link mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold transition">
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
