"use client";

import type { RefObject } from "react";
import { Search, Sparkles } from "lucide-react";
import { theme } from "../../../theme/theme";

interface SearchSectionProps {
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function SearchSection({ query, inputRef, onQueryChange, onSubmit }: SearchSectionProps) {
  return (
    <form
      data-testid="compact-hero-search"
      className="mt-5 w-full min-w-0 max-w-full rounded-xl border border-sky-200/35 p-1.5 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_0_42px_rgba(14,165,233,0.28),24px_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-200 focus-within:border-sky-200/60 focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_0_46px_rgba(14,165,233,0.38),0_0_26px_rgba(246,199,104,0.14)] motion-safe:animate-[agentReveal_500ms_ease-out_240ms_both] sm:max-w-[560px] lg:max-w-[640px]"
      style={{ backgroundColor: `${theme.colors.home.panel}b8` }}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(query);
      }}
    >
      <div className="flex min-w-0 flex-col gap-2 md:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-100/70" />
          <input
            ref={inputRef}
            id="tools-search"
            type="search"
            name="q"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="比如：毕业论文排版 / 答辩 PPT / Excel 数据分析"
            data-global-search-target="home"
            className="min-h-12 w-full rounded-lg border border-white/10 bg-white/8 py-3 pl-10 pr-3 text-sm text-slate-50 outline-none transition duration-200 placeholder:text-slate-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(56,189,248,0.20)]"
            style={{ caretColor: theme.colors.home.gold }}
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_26px_rgba(246,199,104,0.32)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
          style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.home.accent} 0%, ${theme.colors.home.gold} 100%)` }}
        >
          <Sparkles className="h-4 w-4" />
          开始找
        </button>
      </div>
    </form>
  );
}
