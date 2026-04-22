"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteAdminReview, fetchAdminReviews } from "../../lib/catalog-api";
import type { AdminReviewListItem } from "../../lib/catalog-types";

export default function AdminReviewsManager() {
  const [items, setItems] = useState<AdminReviewListItem[]>([]);
  const [toolSlug, setToolSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextToolSlug = toolSlug) => {
    setLoading(true);
    try {
      const reviews = await fetchAdminReviews(nextToolSlug || undefined);
      setItems(reviews);
      setError(null);
    } catch {
      setError("评论列表加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [toolSlug]);

  useEffect(() => {
    void load("");
  }, [load]);

  async function handleDelete(reviewId: number) {
    try {
      await deleteAdminReview(reviewId);
      setMessage("评论已删除。");
      await load();
    } catch {
      setMessage("删除失败，请稍后重试。");
    }
  }

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">正在加载评论列表...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">{error}</div>;
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">评论管理</h2>
          <p className="mt-1 text-sm text-slate-500">这里用于删除不合规内容，不包含评论审核流。</p>
        </div>
        <div className="flex gap-2">
          <input value={toolSlug} onChange={(event) => setToolSlug(event.target.value)} placeholder="按工具 slug 筛选" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm" />
          <button type="button" onClick={() => void load()} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            筛选
          </button>
        </div>
      </div>
      {message ? <p className="mb-3 text-sm text-slate-600">{message}</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.toolName}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.sourceType}</span>
                  {item.username ? <span className="text-xs text-slate-500">@{item.username}</span> : null}
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.body}</p>
              </div>
              <button type="button" onClick={() => void handleDelete(item.id)} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600">
                删除
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">暂无评论</div> : null}
      </div>
    </div>
  );
}
