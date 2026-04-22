"use client";

import { useEffect, useState } from "react";
import { fetchAdminRanking, fetchAdminRankings, saveAdminRanking } from "../../lib/catalog-api";
import type { AdminRankingListItem, AdminRankingPayload } from "../../lib/catalog-types";

const EMPTY_FORM: AdminRankingPayload = {
  slug: "",
  title: "",
  description: "",
  items: [{ toolSlug: "", rank: 1, reason: "" }],
};

export default function AdminRankingsManager() {
  const [rankings, setRankings] = useState<AdminRankingListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminRankingPayload>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRankings() {
    setLoading(true);
    try {
      const rows = await fetchAdminRankings();
      setRankings(rows);
      setError(null);
    } catch {
      setError("榜单列表加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRankings();
  }, []);

  async function handleSelect(rankingId: number) {
    try {
      const payload = await fetchAdminRanking(rankingId);
      setSelectedId(rankingId);
      setForm(payload);
      setMessage(null);
    } catch {
      setMessage("榜单详情加载失败，请稍后重试。");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveAdminRanking(
        {
          ...form,
          items: form.items.filter((item) => item.toolSlug.trim() && item.reason.trim()),
        },
        selectedId || undefined,
      );
      setMessage("榜单已保存。");
      await loadRankings();
      if (!selectedId) {
        setForm(EMPTY_FORM);
      }
    } catch {
      setMessage("保存失败，请稍后重试。");
    }
  }

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">正在加载榜单列表...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">{error}</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">榜单列表</h2>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setForm(EMPTY_FORM);
              setMessage(null);
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            新建
          </button>
        </div>
        <div className="space-y-2">
          {rankings.map((item) => (
            <button key={item.id} type="button" onClick={() => void handleSelect(item.id)} className={`w-full rounded-2xl border px-4 py-3 text-left ${selectedId === item.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs opacity-70">
                {item.slug} · {item.itemCount} 项
              </div>
            </button>
          ))}
        </div>
      </div>

      <form className="rounded-[28px] border border-slate-200 bg-white p-6" onSubmit={(event) => void handleSubmit(event)}>
        <h2 className="text-lg font-semibold text-slate-900">{selectedId ? "编辑榜单" : "新建榜单"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>标题</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
        </div>
        <label className="mt-4 block space-y-2 text-sm text-slate-700">
          <span>描述</span>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        </label>
        <div className="mt-4 space-y-3">
          {form.items.map((item, index) => (
            <div key={`${item.toolSlug}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-[120px_1fr_1fr]">
              <input value={item.rank} onChange={(event) => setForm((current) => ({ ...current, items: current.items.map((row, rowIndex) => rowIndex === index ? { ...row, rank: Number(event.target.value || 1) } : row) }))} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={item.toolSlug} onChange={(event) => setForm((current) => ({ ...current, items: current.items.map((row, rowIndex) => rowIndex === index ? { ...row, toolSlug: event.target.value } : row) }))} placeholder="tool slug" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={item.reason} onChange={(event) => setForm((current) => ({ ...current, items: current.items.map((row, rowIndex) => rowIndex === index ? { ...row, reason: event.target.value } : row) }))} placeholder="推荐理由" className="rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, { toolSlug: "", rank: current.items.length + 1, reason: "" }] }))} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
            新增一项
          </button>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
            保存榜单
          </button>
          {message ? <span className="text-sm text-slate-600">{message}</span> : null}
        </div>
      </form>
    </div>
  );
}
