import { ExternalLink } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import ToolCard from "../components/ToolCard";
import ToolLogo from "../components/ToolLogo";
import ToolReviewsPanel from "../components/ToolReviewsPanel";
import BackToResultsLink from "../components/BackToResultsLink";
import type { ToolDetail, ToolReviewsResponse, ToolSummary } from "../lib/catalog-types";
import { buildDecisionBadges, buildToolsHref, hasValidOfficialUrl, slugifyLabel } from "../lib/catalog-utils";
import {
  buildAccessBadgeMeta,
  detectPriceLabel,
  formatPriceRange,
  formatPricingType,
  getAccessBadgeClassName,
  getScoreBadge,
  isTopPick,
} from "../lib/tool-display";

interface ToolDetailPageProps {
  tool: ToolDetail | null;
  relatedTools: ToolSummary[];
  reviews: ToolReviewsResponse | null;
}

function fallbackText(value?: string | null, defaultValue = "待补充") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : defaultValue;
}

function fallbackList(values?: string[] | null, defaultValue = "待补充") {
  return values && values.length > 0 ? values : [defaultValue];
}

/** 基于 tags 自动推导核心能力占位文案 */
function deriveAbilitiesFromTags(tags: string[]): string[] {
  if (!tags || tags.length === 0) return ["核心能力待补充"];
  // 每个 tag 转化为一句能力描述
  return tags.slice(0, 4).map((tag) => `支持${tag}相关能力`);
}

/** 基于 tags 自动推导适用人群占位文案 */
function deriveAudienceFromTags(tags: string[]): string[] {
  if (!tags || tags.length === 0) return ["适用人群待补充"];
  return tags.slice(0, 3).map((tag) => `${tag}领域从业者`);
}

/** 评分星级可视化组件（进度条形式） */
function ScoreBar({ score, reviewCount }: { score: number; reviewCount: number }) {
  // 满分 10 分制
  const percentage = Math.min(100, Math.max(0, (score / 10) * 100));
  const stars = Math.round(score / 2); // 转换为 5 星制
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-slate-900">{score.toFixed(1)}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < stars ? "text-amber-400" : "text-slate-200"}`}>★</span>
          ))}
        </div>
        <span className="text-xs text-slate-500">{reviewCount} 条评价</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ToolDetailPage({ tool, relatedTools, reviews }: ToolDetailPageProps) {
  if (!tool) {
    return (
      <div className="page-shell">
        <Header currentPath="/" currentRoute="/" />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950">暂时找不到这个工具</h1>
          <p className="mt-3 text-sm text-slate-600">当前工具信息可能已下架或尚未收录，你可以先回到目录继续浏览其他结果。</p>
          <BackToResultsLink
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const categoryHref = buildToolsHref({}, { category: tool.categorySlug || slugifyLabel(tool.category), page: 1 });
  const scoreBadge = getScoreBadge(tool.reviewCount, tool.score);
  const accessBadges = buildAccessBadgeMeta(tool.accessFlags);
  const officialUrlAvailable = hasValidOfficialUrl(tool.officialUrl);
  // 关键决策信息字段（价格、平台、访问条件整合）
  const decisionFields = [
    { label: "💰 价格", value: fallbackText(formatPricingType(tool), "价格待确认") },
    { label: "📊 价格区间", value: fallbackText(formatPriceRange(tool), "价格区间待确认") },
    { label: "💻 适用平台", value: fallbackText(tool.platforms) },
    { label: "🌐 访问条件", value: accessBadges.length > 0 ? accessBadges.map((item) => item.label).join(" / ") : "待确认" },
  ];
  const infoFields = [
    { label: "分类", value: fallbackText(tool.category) },
    { label: "开发者", value: fallbackText(tool.developer) },
    { label: "最近校验", value: fallbackText(tool.lastVerifiedAt?.slice(0, 10), "暂无记录") },
    { label: "地区", value: fallbackText([tool.country, tool.city].filter(Boolean).join(" / "), "待补充") },
  ];
  const scenarioRecommendations = tool.scenarioRecommendations ?? [];
  const reviewPreview = tool.reviewPreview ?? [];
  const pitfalls = tool.pitfalls ?? [];
  // 核心能力/适用人群：空列表时基于 tags 自动推导
  const rawAbilities = tool.abilities ?? [];
  const rawAudience = tool.targetAudience ?? [];
  const coreAbilities = rawAbilities.length > 0 ? rawAbilities : deriveAbilitiesFromTags(tool.tags);
  const targetAudience = rawAudience.length > 0 ? rawAudience : deriveAudienceFromTags(tool.tags);
  const pros = tool.pros ?? [];
  const cons = tool.cons ?? [];

  return (
    <div className="page-shell">
      <Header currentPath={`/tools/${tool.slug}`} currentRoute={`/tools/${tool.slug}`} />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: tool.name }]} />

          {/* ========== 关键决策信息面板 ========== */}
          <section className="mt-6 rounded-[28px] border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 px-5 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] md:px-8">
            <h2 className="text-sm font-semibold text-blue-900">📋 关键决策信息</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {decisionFields.map((field) => (
                <div key={field.label} className="rounded-2xl border border-blue-200/60 bg-white/80 px-4 py-3">
                  <p className="text-xs font-semibold text-blue-600">{field.label}</p>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-slate-800">{field.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ========== 顶部信息卡片 ========== */}
          <section className="mt-4 rounded-[32px] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:px-8 md:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                <div style={{ viewTransitionName: `tool-logo-${tool.slug}` }}>
                  <ToolLogo slug={tool.slug} name={tool.name} logoPath={tool.logoPath} size="lg" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl"
                      style={{ viewTransitionName: `tool-title-${tool.slug}` }}
                    >
                      {tool.name}
                    </h1>
                    {scoreBadge ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
                        {scoreBadge.label}
                      </span>
                    ) : null}
                    <a href={categoryHref} className="rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                      {fallbackText(tool.category)}
                    </a>
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    {fallbackText(tool.summary, "这款工具的简介还在补充中。")}
                  </p>

                  {/* 评分星级可视化 */}
                  {(tool.reviewCount ?? 0) >= 1 ? (
                    <div className="mt-4 max-w-xs">
                      <ScoreBar score={tool.score} reviewCount={tool.reviewCount ?? 0} />
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {accessBadges.map((badge) => (
                      <span key={badge.label} className={`rounded-full px-3 py-1 text-xs font-medium ${getAccessBadgeClassName(badge.tone)}`}>
                        {badge.label}
                      </span>
                    ))}
                    {buildDecisionBadges({
                      price: tool.price,
                      summary: tool.summary,
                      tags: tool.tags,
                      platforms: tool.platforms,
                    }).map((badge) => (
                      <span key={badge} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {infoFields.map((field) => (
                      <div key={field.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{field.label}</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 lg:w-[220px]">
                {officialUrlAvailable ? (
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                  >
                    访问官网
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-medium text-slate-500">
                    官网待补充
                  </span>
                )}

                <BackToResultsLink className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium" />
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="panel-base rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-slate-900">工具简介</h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">
                  {fallbackText(tool.description, fallbackText(tool.summary, "详细介绍待补充"))}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">核心能力</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {coreAbilities.map((item) => (
                      <li key={item} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">适用人群</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {targetAudience.map((item) => (
                      <li key={item} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {(pros.length > 0 || cons.length > 0) ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">优缺点速览</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
                      <p className="text-sm font-semibold text-emerald-700">优点</p>
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                        {fallbackList(pros, "优点待补充").map((item) => (
                          <li key={item}>✅ {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                      <p className="text-sm font-semibold text-amber-700">限制</p>
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                        {fallbackList(cons, "限制待补充").map((item) => (
                          <li key={item}>⚠️ {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">适用场景</h2>
                  {scenarioRecommendations.length > 0 ? (
                    <div className="mt-4 grid gap-4">
                      {scenarioRecommendations.map((item) => (
                        <div key={`${item.audience}-${item.task}`} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.audience}</p>
                          <h3 className="mt-2 text-base font-semibold text-slate-900">{item.task}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-700">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                      适用场景正在补充中，暂时可先参考简介和核心能力判断是否匹配。
                    </div>
                  )}
                </div>

                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">避坑提醒</h2>
                  {pitfalls.length > 0 ? (
                    <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-700">
                      {pitfalls.map((item) => (
                        <li key={item} className="rounded-2xl border border-rose-200/70 bg-rose-50/60 px-4 py-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                      暂未收录明显风险点，实际使用前仍建议先小范围试用。
                    </div>
                  )}
                </div>
              </div>

              <div className="panel-base rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-slate-900">标签</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {accessBadges.map((badge) => (
                    <span key={badge.label} className={`rounded-full px-3 py-1.5 text-sm font-medium ${getAccessBadgeClassName(badge.tone)}`}>
                      {badge.label}
                    </span>
                  ))}
                  {fallbackList(tool.tags, "标签待补充").map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {reviewPreview.length > 0 ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">编辑点评 / 用户反馈</h2>
                  <div className="mt-4 space-y-4">
                    {reviewPreview.map((item, index) => (
                      <article key={`${item.sourceType}-${item.title}-${index}`} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            {item.sourceType === "editor" ? "编辑点评" : "用户反馈"}
                          </span>
                          {typeof item.rating === "number" ? (
                            <span className="text-sm font-semibold text-amber-600">★ {item.rating.toFixed(1)}</span>
                          ) : null}
                        </div>
                        {item.title ? <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3> : null}
                        <p className="mt-2 text-sm leading-7 text-slate-700">{fallbackText(item.body, "点评内容待补充")}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              <ToolReviewsPanel toolSlug={tool.slug} reviews={reviews} summary={tool.ratingSummary ?? reviews?.summary ?? null} />
            </div>

            <aside className="space-y-6">
              {relatedTools.length > 0 ? (
                <div className="panel-base rounded-[28px] p-5">
                  <h2 className="text-lg font-semibold text-slate-900">同类工具</h2>
                  <div className="mt-4 space-y-4">
                    {relatedTools.map((item) => (
                      <ToolCard
                        key={item.slug}
                        slug={item.slug}
                        name={item.name}
                        summary={item.summary}
                        category={item.category}
                        tags={item.tags}
                        url={item.officialUrl}
                        logoPath={item.logoPath}
                        score={item.score}
                        reviewCount={item.reviewCount}
                        accessFlags={item.accessFlags}
                        priceLabel={detectPriceLabel(item)}
                        decisionBadges={buildDecisionBadges({
                          price: item.price,
                          summary: item.summary,
                          tags: item.tags,
                        })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="panel-base rounded-[28px] border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
                  暂时没有可展示的同类工具。
                </div>
              )}
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
