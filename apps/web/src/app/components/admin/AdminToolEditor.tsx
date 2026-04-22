"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAdminTool, saveAdminTool } from "../../lib/catalog-api";
import type { AdminToolPayload, ToolDetail } from "../../lib/catalog-types";

const EMPTY_FORM: AdminToolPayload = {
  slug: "",
  name: "",
  categorySlug: "",
  categoryName: "",
  summary: "",
  description: "",
  editorComment: "",
  developer: "",
  country: "",
  city: "",
  price: "",
  platforms: "",
  officialUrl: "",
  logoPath: "",
  featured: false,
  status: "draft",
  pricingType: "unknown",
  priceMinCny: null,
  priceMaxCny: null,
  freeAllowanceText: "",
  accessFlags: { needs_vpn: false, cn_lang: false, cn_payment: false },
  tags: [],
  createdOn: null,
  lastVerifiedAt: null,
};

const TEXT_FIELD_KEYS = [
  "slug",
  "name",
  "categorySlug",
  "categoryName",
  "officialUrl",
  "logoPath",
  "developer",
  "platforms",
  "price",
  "pricingType",
] as const;

function buildFormState(tool: ToolDetail): AdminToolPayload {
  return {
    slug: tool.slug,
    name: tool.name,
    categorySlug: tool.categorySlug || "",
    categoryName: tool.category,
    summary: tool.summary,
    description: tool.description,
    editorComment: tool.editorComment,
    developer: tool.developer,
    country: tool.country,
    city: tool.city,
    price: tool.price,
    platforms: tool.platforms,
    officialUrl: tool.officialUrl,
    logoPath: tool.logoPath || "",
    featured: tool.featured,
    status: tool.status,
    pricingType: tool.pricingType || "unknown",
    priceMinCny: tool.priceMinCny ?? null,
    priceMaxCny: tool.priceMaxCny ?? null,
    freeAllowanceText: tool.freeAllowanceText || "",
    accessFlags: {
      needs_vpn: tool.accessFlags?.needsVpn ?? false,
      cn_lang: tool.accessFlags?.cnLang ?? false,
      cn_payment: tool.accessFlags?.cnPayment ?? false,
    },
    tags: tool.tags || [],
    createdOn: tool.createdAt?.slice(0, 10) || null,
    lastVerifiedAt: tool.lastVerifiedAt?.slice(0, 10) || null,
  };
}

export default function AdminToolEditor({ toolId }: { toolId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<AdminToolPayload>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(toolId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toolId) return;
    void fetchAdminTool(toolId)
      .then((tool) => {
        setForm(buildFormState(tool));
        setTagInput((tool.tags || []).join(", "));
        setError(null);
      })
      .catch(() => setError("宸ュ叿璇︽儏鍔犺浇澶辫触锛岃绋嶅悗閲嶈瘯銆?"))
      .finally(() => setLoading(false));
  }, [toolId]);

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">姝ｅ湪鍔犺浇宸ュ叿璇︽儏...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">{error}</div>;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        tags: tagInput.split(",").map((item) => item.trim()).filter(Boolean),
      };
      const saved = await saveAdminTool(payload, toolId);
      setMessage("淇濆瓨鎴愬姛锛屽悗鍙颁俊鎭凡鏇存柊銆?");
      if (!toolId) {
        router.push(`/admin/tools/${saved.id}`);
      }
    } catch {
      setMessage("淇濆瓨澶辫触锛岃妫€鏌ヨ緭鍏ュ悗閲嶈瘯銆?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rounded-[28px] border border-slate-200 bg-white p-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-4 md:grid-cols-2">
        {TEXT_FIELD_KEYS.map((key) => (
          <label key={key} className="space-y-2 text-sm text-slate-700">
            <span>
              {
                {
                  slug: "Slug",
                  name: "鍚嶇О",
                  categorySlug: "鍒嗙被 Slug",
                  categoryName: "鍒嗙被鍚嶇О",
                  officialUrl: "瀹樼綉閾炬帴",
                  logoPath: "Logo 璺緞",
                  developer: "寮€鍙戣€?",
                  platforms: "鏀寔骞冲彴",
                  price: "浠锋牸鏂囨",
                  pricingType: "浠锋牸绫诲瀷",
                }[key]
              }
            </span>
            <input
              value={form[key] || ""}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-2 text-sm text-slate-700">
        <span>鎽樿</span>
        <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      </label>
      <label className="mt-4 block space-y-2 text-sm text-slate-700">
        <span>璇︽儏鎻忚堪</span>
        <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      </label>
      <label className="mt-4 block space-y-2 text-sm text-slate-700">
        <span>缂栬緫鐐硅瘎</span>
        <textarea value={form.editorComment} onChange={(event) => setForm((current) => ({ ...current, editorComment: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      </label>
      <label className="mt-4 block space-y-2 text-sm text-slate-700">
        <span>鏍囩锛岄€楀彿鍒嗛殧</span>
        <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-700">
          <span>鐘舵€?</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminToolPayload["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>鍒涘缓鏃ユ湡</span>
          <input type="date" value={form.createdOn || ""} onChange={(event) => setForm((current) => ({ ...current, createdOn: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>鏈€鍚庢牎楠屾棩鏈?</span>
          <input type="date" value={form.lastVerifiedAt || ""} onChange={(event) => setForm((current) => ({ ...current, lastVerifiedAt: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
          璁句负绮鹃€?
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean((form.accessFlags as Record<string, boolean | null> | undefined)?.needs_vpn)}
            onChange={(event) => setForm((current) => ({ ...current, accessFlags: { ...(current.accessFlags as Record<string, boolean | null>), needs_vpn: event.target.checked } }))}
          />
          闇€瑕?VPN
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean((form.accessFlags as Record<string, boolean | null> | undefined)?.cn_lang)}
            onChange={(event) => setForm((current) => ({ ...current, accessFlags: { ...(current.accessFlags as Record<string, boolean | null>), cn_lang: event.target.checked } }))}
          />
          涓枃鐣岄潰
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean((form.accessFlags as Record<string, boolean | null> | undefined)?.cn_payment)}
            onChange={(event) => setForm((current) => ({ ...current, accessFlags: { ...(current.accessFlags as Record<string, boolean | null>), cn_payment: event.target.checked } }))}
          />
          鍥藉唴鏀粯
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
          {saving ? "淇濆瓨涓?.." : "淇濆瓨宸ュ叿"}
        </button>
        {message ? <span className="text-sm text-slate-600">{message}</span> : null}
      </div>
    </form>
  );
}
