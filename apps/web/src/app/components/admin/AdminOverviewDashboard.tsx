"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminOverview } from "../../lib/catalog-api";
import type { AdminOverviewResponse } from "../../lib/catalog-types";
import { withPublicPath } from "../../lib/public-path";

const EMPTY_OVERVIEW: AdminOverviewResponse = {
  toolCount: 0,
  draftToolCount: 0,
  publishedToolCount: 0,
  reviewCount: 0,
  rankingCount: 0,
  recentUpdatedTools: [],
  matchPlanCount: 0,
  publishedMatchPlanCount: 0,
  recentPublishedMatchPlans: [],
};

const quickLinks = [
  { href: "/admin/tools", label: "管理工具", description: "维护工具资料、发布状态和展示信息。" },
  { href: "/admin/reviews", label: "处理评论", description: "查看用户评论并删除不合规内容。" },
  { href: "/admin/rankings", label: "维护榜单", description: "调整首页榜单和工具排序。" },
  { href: "/admin/match-plans", label: "匹配策略", description: "配置实时推荐策略、触发关键词和运营理由。" },
];

export default function AdminOverviewDashboard() {
  const [overview, setOverview] = useState<AdminOverviewResponse>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetchAdminOverview()
      .then((payload) => {
        if (!active) return;
        setOverview(payload);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setOverview(EMPTY_OVERVIEW);
        setError(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">正在加载后台概览...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "工具总数", value: overview.toolCount, tone: "text-slate-950" },
          { label: "待发布工具", value: overview.draftToolCount, tone: "text-amber-600" },
          { label: "已发布工具", value: overview.publishedToolCount, tone: "text-emerald-600" },
          { label: "评论总数", value: overview.reviewCount, tone: "text-sky-600" },
          { label: "榜单总数", value: overview.rankingCount, tone: "text-violet-600" },
          { label: "已发布策略", value: overview.publishedMatchPlanCount ?? 0, tone: "text-indigo-600" },
        ].map((item) => (
          <article key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">最近更新</h2>
              <p className="mt-1 text-sm text-slate-500">优先检查最近变更过的工具资料与发布状态。</p>
            </div>
            <Link href={withPublicPath("/admin/tools")} className="text-sm font-medium text-slate-900">
              查看全部工具
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {overview.recentUpdatedTools.map((tool) => (
              <Link
                key={tool.id}
                href={withPublicPath(`/admin/tools/${tool.id}`)}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-slate-900">{tool.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{tool.slug}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-700">{tool.status}</div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(tool.updatedAt).toLocaleDateString("zh-CN")}</div>
                </div>
              </Link>
            ))}
            {overview.recentUpdatedTools.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">暂无最近更新的工具记录。</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">最近发布策略</h2>
          <p className="mt-1 text-sm text-slate-500">这些策略会直接影响前台实时匹配排序。</p>
          <div className="mt-4 space-y-3">
            {(overview.recentPublishedMatchPlans ?? []).map((plan) => (
              <Link
                key={plan.id}
                href={withPublicPath(`/admin/match-plans?plan=${plan.id}`)}
                className="block rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
              >
                <div className="font-medium text-slate-900">{plan.title}</div>
                <div className="mt-1 text-xs text-slate-500">{plan.slug}</div>
              </Link>
            ))}
            {(overview.recentPublishedMatchPlans ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">暂无已发布匹配策略。</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">快捷操作</h2>
          <p className="mt-1 text-sm text-slate-500">从这里进入常用后台模块，完成内容维护闭环。</p>
          <div className="mt-4 space-y-3">
            {quickLinks.map((item) => (
              <Link key={item.href} href={withPublicPath(item.href)} className="block rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-4">
                <div className="font-medium text-slate-900">{item.label}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
