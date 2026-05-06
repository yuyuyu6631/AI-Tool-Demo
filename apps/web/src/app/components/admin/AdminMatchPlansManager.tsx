"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminMatchPlan,
  fetchAdminMatchPlans,
  fetchAdminTools,
  previewAdminMatchPlan,
  publishAdminMatchPlan,
  saveAdminMatchPlan,
} from "../../lib/catalog-api";
import type {
  AdminMatchPlanListItem,
  AdminMatchPlanPayload,
  AdminMatchPlanPreviewResponse,
  AdminToolListItem,
} from "../../lib/catalog-types";

const EMPTY_FORM: AdminMatchPlanPayload = {
  slug: "",
  title: "",
  description: "",
  persona: "",
  scenario: "",
  triggerKeywords: [],
  status: "draft",
  sortOrder: 0,
  tools: [{ toolSlug: "", reason: "", sortOrder: 0, weight: 100 }],
};

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

function splitKeywords(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,，\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function formatDate(value?: string | null) {
  if (!value) return "未发布";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未发布";
  return date.toLocaleDateString("zh-CN");
}

export default function AdminMatchPlansManager() {
  const [plans, setPlans] = useState<AdminMatchPlanListItem[]>([]);
  const [tools, setTools] = useState<AdminToolListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminMatchPlanPayload>(EMPTY_FORM);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [toolQuery, setToolQuery] = useState("");
  const [previewQuery, setPreviewQuery] = useState("");
  const [preview, setPreview] = useState<AdminMatchPlanPreviewResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [nextPlans, nextTools] = await Promise.all([fetchAdminMatchPlans(), fetchAdminTools()]);
      setPlans(nextPlans);
      setTools(nextTools);
      setError(null);
    } catch {
      setError("匹配策略加载失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const publishedTools = useMemo(() => tools.filter((item) => item.status === "published"), [tools]);
  const toolOptions = useMemo(() => {
    const normalized = toolQuery.trim().toLowerCase();
    if (!normalized) return publishedTools.slice(0, 8);
    return publishedTools
      .filter((item) => `${item.name} ${item.slug} ${item.categoryName}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [publishedTools, toolQuery]);

  function startNew() {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setKeywordDraft("");
    setPreview(null);
    setMessage(null);
  }

  async function handleSelect(planId: number) {
    try {
      const payload = await fetchAdminMatchPlan(planId);
      setSelectedId(planId);
      setForm(payload);
      setKeywordDraft(payload.triggerKeywords.join(", "));
      setPreview(null);
      setMessage(null);
    } catch {
      setMessage("策略详情加载失败，请稍后重试。");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      triggerKeywords: splitKeywords(keywordDraft),
      tools: form.tools.filter((item) => item.toolSlug.trim()),
      status: form.status === "published" ? "draft" : form.status,
    };
    try {
      const saved = await saveAdminMatchPlan(payload, selectedId || undefined);
      setForm(saved);
      setKeywordDraft(saved.triggerKeywords.join(", "));
      setMessage("策略草稿已保存。");
      await load();
      if (!selectedId) {
        const created = (await fetchAdminMatchPlans()).find((item) => item.slug === saved.slug);
        if (created) setSelectedId(created.id);
      }
    } catch {
      setMessage("保存失败，请检查 slug、工具和字段是否有效。");
    }
  }

  async function handlePublish() {
    if (!selectedId) {
      setMessage("请先保存策略草稿，再发布。");
      return;
    }
    try {
      const published = await publishAdminMatchPlan(selectedId);
      setForm(published);
      setKeywordDraft(published.triggerKeywords.join(", "));
      setMessage("策略已发布，并已刷新推荐缓存。");
      await load();
    } catch {
      setMessage("发布失败：策略必须至少包含一个已发布工具。");
    }
  }

  async function handlePreview() {
    if (!selectedId) {
      setMessage("请先保存策略草稿，再预览。");
      return;
    }
    try {
      const payload = await previewAdminMatchPlan(selectedId, { query: previewQuery, scenario: form.scenario, tags: splitKeywords(keywordDraft) });
      setPreview(payload);
      setMessage(payload.matched ? "预览命中当前策略。" : "预览未命中当前策略。");
    } catch {
      setMessage("预览失败，请稍后重试。");
    }
  }

  function updateTool(index: number, patch: Partial<AdminMatchPlanPayload["tools"][number]>) {
    setForm((current) => ({
      ...current,
      tools: current.tools.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">正在加载匹配策略...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-5" data-testid="match-plan-list">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">匹配策略</h2>
            <p className="mt-1 text-sm text-slate-500">发布后实时影响推荐排序。</p>
          </div>
          <button type="button" onClick={startNew} className="rounded bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            新建
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => void handleSelect(plan.id)}
              className={`w-full rounded border px-3 py-3 text-left ${selectedId === plan.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"}`}
            >
              <div className="truncate font-medium">{plan.title}</div>
              <div className="mt-1 truncate text-xs opacity-70">
                {plan.slug} · {STATUS_LABELS[plan.status] ?? plan.status} · {plan.toolCount} 工具
              </div>
              <div className="mt-1 text-xs opacity-70">发布：{formatDate(plan.publishedAt)}</div>
            </button>
          ))}
          {plans.length === 0 ? (
            <div className="rounded border border-dashed border-slate-200 p-5 text-sm text-slate-500">暂无匹配策略。新建一个策略后，可用关键词驱动前台推荐。</div>
          ) : null}
        </div>
      </aside>

      <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={(event) => void handleSubmit(event)} data-testid="match-plan-editor">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{selectedId ? "编辑策略" : "新建策略"}</h2>
            <p className="mt-1 text-sm text-slate-500">保存为草稿后可预览，发布后立即清缓存并生效。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              保存草稿
            </button>
            <button type="button" onClick={() => void handlePublish()} className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              发布
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="h-11 w-full rounded border border-slate-200 px-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>标题</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="h-11 w-full rounded border border-slate-200 px-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>角色 Persona</span>
            <input value={form.persona} onChange={(event) => setForm((current) => ({ ...current, persona: event.target.value }))} className="h-11 w-full rounded border border-slate-200 px-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>场景</span>
            <input value={form.scenario} onChange={(event) => setForm((current) => ({ ...current, scenario: event.target.value }))} className="h-11 w-full rounded border border-slate-200 px-3" />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm text-slate-700">
          <span>触发关键词</span>
          <textarea value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} rows={2} placeholder="例如：论文, academic-writing, 文档排版" className="w-full rounded border border-slate-200 px-3 py-2" />
        </label>
        <label className="mt-4 block space-y-2 text-sm text-slate-700">
          <span>描述</span>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={2} className="w-full rounded border border-slate-200 px-3 py-2" />
        </label>

        <section className="mt-5 rounded border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="font-semibold text-slate-950">推荐工具</h3>
            <input value={toolQuery} onChange={(event) => setToolQuery(event.target.value)} placeholder="搜索已发布工具" className="h-10 rounded border border-slate-200 bg-white px-3 text-sm" />
          </div>
          {toolQuery ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {toolOptions.map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      tools: [...current.tools, { toolSlug: tool.slug, reason: "", sortOrder: current.tools.length, weight: 100 }],
                    }))
                  }
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 space-y-3">
            {form.tools.map((item, index) => (
              <div key={`${item.toolSlug}-${index}`} className="grid gap-3 rounded border border-slate-200 bg-white p-3 lg:grid-cols-[110px_1fr_90px_90px_1fr_auto]">
                <input type="number" value={item.sortOrder} onChange={(event) => updateTool(index, { sortOrder: Number(event.target.value || 0) })} className="h-10 rounded border border-slate-200 px-2 text-sm" aria-label="排序" />
                <input value={item.toolSlug} onChange={(event) => updateTool(index, { toolSlug: event.target.value })} placeholder="tool slug" className="h-10 rounded border border-slate-200 px-3 text-sm" />
                <input type="number" value={item.weight} onChange={(event) => updateTool(index, { weight: Number(event.target.value || 0) })} className="h-10 rounded border border-slate-200 px-2 text-sm" aria-label="权重" />
                <div className="flex items-center text-xs text-slate-500">权重</div>
                <input value={item.reason} onChange={(event) => updateTool(index, { reason: event.target.value })} placeholder="推荐理由" className="h-10 rounded border border-slate-200 px-3 text-sm" />
                <button type="button" onClick={() => setForm((current) => ({ ...current, tools: current.tools.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded border border-slate-200 px-3 text-sm text-slate-600">
                  移除
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setForm((current) => ({ ...current, tools: [...current.tools, { toolSlug: "", reason: "", sortOrder: current.tools.length, weight: 100 }] }))} className="mt-3 rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            新增工具行
          </button>
        </section>

        <section className="mt-5 rounded border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-950">预览</h3>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <input value={previewQuery} onChange={(event) => setPreviewQuery(event.target.value)} placeholder="输入前台搜索词，例如：我要写论文" className="h-10 flex-1 rounded border border-slate-200 px-3 text-sm" />
            <button type="button" onClick={() => void handlePreview()} className="rounded border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
              预览命中
            </button>
          </div>
          {preview ? (
            <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700" data-testid="match-plan-preview">
              <div>命中：{preview.matched ? preview.matchedKeywords.join(", ") || "是" : "否"}</div>
              <div className="mt-2 space-y-1">
                {preview.tools.map((item) => (
                  <div key={item.toolSlug} className={item.available ? "text-slate-700" : "text-rose-700"}>
                    {item.sortOrder}. {item.toolName || item.toolSlug} · {item.status} · {item.reason || "未填写理由"}
                  </div>
                ))}
              </div>
              {preview.warnings.length ? <div className="mt-2 text-amber-700">{preview.warnings.join("；")}</div> : null}
            </div>
          ) : null}
        </section>

        {message ? <div className="mt-4 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
      </form>
    </div>
  );
}
