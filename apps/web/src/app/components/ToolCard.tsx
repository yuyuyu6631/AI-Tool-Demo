"use client";

import { Link } from "next-view-transitions";
import { ArrowRight, ExternalLink, Plus, Star } from "lucide-react";
import type { AccessFlags, AgentToolPlanItem, ToolMediaItem } from "../lib/catalog-types";
import { repairDisplayList, repairDisplayText } from "../lib/catalog-utils";
import { withPublicPath } from "../lib/public-path";
import { buildAccessBadgeMeta } from "../lib/tool-display";
import { theme } from "../../theme/theme";
import ToolLogo from "./ToolLogo";

export interface ToolCardProps {
  slug: string;
  name: string;
  summary: string;
  category?: string;
  tags?: string[];
  url: string;
  logoPath?: string | null;
  score?: number | null;
  reviewCount?: number;
  accessFlags?: AccessFlags | null;
  priceLabel?: string | null;
  decisionBadges?: string[];
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: (() => void) | undefined;
  onDetailClick?: (() => void) | undefined;
  reason?: string | null;
  features?: string[];
  limitations?: string[];
  bestFor?: string[];
  dealSummary?: string;
  primaryMedia?: ToolMediaItem | null;
  agentPlan?: AgentToolPlanItem;
}

const PRICE_HINTS: Record<string, string> = {
  free: "免费",
  freemium: "免费增值",
  subscription: "订阅制",
  "one-time": "买断",
  contact: "联系销售",
};

function getPriceText(priceLabel?: string | null, dealSummary?: string, agentPlan?: AgentToolPlanItem) {
  const explicit = repairDisplayText(agentPlan?.free_signal || dealSummary || "", "");
  if (explicit) return explicit;
  if (priceLabel && PRICE_HINTS[priceLabel]) return PRICE_HINTS[priceLabel];
  return "价格待核验";
}

function getScoreText(score?: number | null) {
  return Number.isFinite(score) && typeof score === "number" && score > 0 ? score.toFixed(1) : "待评";
}

export default function ToolCard({
  slug,
  name,
  summary,
  tags = [],
  url,
  logoPath = null,
  score = null,
  reviewCount = 0,
  accessFlags = null,
  priceLabel = null,
  compareSelected = false,
  compareDisabled = false,
  onCompareToggle,
  onDetailClick,
  dealSummary = "",
  agentPlan,
}: ToolCardProps) {
  const displayName = repairDisplayText(name, slug);
  const displaySummary = repairDisplayText(summary, "一句话介绍待补充");
  const displayTags = repairDisplayList(tags, 3);
  const accessBadges = buildAccessBadgeMeta(accessFlags).slice(0, 1);
  const priceText = getPriceText(priceLabel, dealSummary, agentPlan);
  const scoreText = getScoreText(score);

  return (
    <article
      className="group flex h-full min-h-[232px] flex-col rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      data-testid="tool-card"
      style={{
        borderColor: theme.colors.surface.borderSoft,
        boxShadow: theme.shadow.card,
        transition: theme.transition.normal,
      }}
    >
      <div className="flex items-start gap-3">
        <div style={{ viewTransitionName: `tool-logo-${slug}` }}>
          <ToolLogo slug={slug} name={displayName} logoPath={logoPath} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link href={withPublicPath(`/tools/${slug}`)} onClick={onDetailClick} className="block min-w-0 flex-1">
              <h3
                style={{ viewTransitionName: `tool-title-${slug}`, color: theme.colors.surface.textPrimary }}
                className="truncate text-base font-semibold"
              >
                {displayName}
              </h3>
            </Link>
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <Star className="h-3 w-3 fill-current" />
              {scoreText}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: theme.colors.surface.textSecondary }}>
            {displaySummary}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          data-testid="price-tag"
          className="inline-flex max-w-full items-center rounded border px-2.5 py-1 text-xs font-semibold"
          style={{
            borderColor: theme.colors.surface.priceBorder,
            backgroundColor: theme.colors.surface.priceBg,
            color: theme.colors.surface.gold,
          }}
        >
          <span className="truncate">{priceText}</span>
        </span>
        {accessBadges.map((badge) => (
          <span key={badge.label} className="inline-flex rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {badge.label}
          </span>
        ))}
      </div>

      {displayTags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="rounded px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: theme.colors.surface.tagBg, color: theme.colors.surface.textMuted }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">{reviewCount > 0 ? `${reviewCount} 条反馈` : "反馈待补充"}</span>
        <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
          {onCompareToggle ? (
            <button
              type="button"
              onClick={onCompareToggle}
              disabled={!compareSelected && compareDisabled}
              aria-pressed={compareSelected}
              title={compareDisabled ? "最多可选 3 个工具" : undefined}
              className={`inline-flex h-9 flex-1 items-center justify-center gap-1 rounded px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:flex-none ${
                compareSelected
                  ? "bg-slate-950 text-white"
                  : compareDisabled
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {compareSelected ? "已加入" : "对比"}
            </button>
          ) : null}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-slate-700 transition hover:bg-slate-50"
            aria-label="官网"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={withPublicPath(`/tools/${slug}`)}
            onClick={onDetailClick}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
          >
            详情
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
