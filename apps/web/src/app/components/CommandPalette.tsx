"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useClientSearch } from "./ClientSearchProvider";
import { parseSearchIntent } from "../utils/nlu-agent";
import type { CategorySummary } from "../lib/catalog-types";

const PRICE_LABELS: Record<string, string> = {
  free: "免费",
  freemium: "免费增值",
  subscription: "订阅",
  "one-time": "一次性付费",
  contact: "联系销售",
};

function resolveCategoryLabel(categories: CategorySummary[], slug: string) {
  return categories.find((category) => (category.canonicalSlug || category.slug) === slug)?.name || slug;
}

function isAvailableSearchTarget(element: HTMLInputElement | HTMLTextAreaElement) {
  if (!element.isConnected || element.disabled) return false;
  if (element.getAttribute("aria-hidden") === "true" || element.hidden) return false;
  if ("type" in element && element.type === "hidden") return false;
  if (element.closest("[hidden],[aria-hidden='true'],[inert]")) return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return true;
}

function focusDeclaredSearchTarget() {
  const candidates = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-global-search-target]"));
  const element = candidates.find(isAvailableSearchTarget);
  if (!element) return false;

  element.focus();
  element.select?.();
  return true;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { tools, categories, fuse } = useClientSearch();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      const usePrimaryShortcut = key === "k" && (event.ctrlKey || event.metaKey);
      const useCompatShortcut = key === "g" && (event.ctrlKey || event.metaKey);

      if (!usePrimaryShortcut && !useCompatShortcut) return;

      if (focusDeclaredSearchTarget()) {
        event.preventDefault();
        setOpen(false);
        return;
      }

      event.preventDefault();
      setOpen(true);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setSearch("");
    router.push(`/tools/${slug}`);
  };

  const nluIntent = useMemo(() => parseSearchIntent(search, categories), [search, categories]);
  const results =
    nluIntent.q && fuse ? fuse.search(nluIntent.q).map((result) => result.item).slice(0, 10) : tools.slice(0, 6);

  const handleGlobalSearch = () => {
    setOpen(false);

    const params = new URLSearchParams();
    if (nluIntent.q) params.set("q", nluIntent.q);
    if (nluIntent.category) params.set("category", nluIntent.category);
    if (nluIntent.price) params.set("price", nluIntent.price);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/28 p-4 backdrop-blur-sm sm:p-6"
    >
      <DialogPrimitive.Title className="sr-only">全局搜索面板</DialogPrimitive.Title>
      <DialogPrimitive.Description className="sr-only">
        搜索工具、分类和任务关键词；如果页面已有搜索框，会优先聚焦当前页面搜索框。
      </DialogPrimitive.Description>
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.18)] ring-1 ring-black/6">
        <Command className="w-full" shouldFilter={false}>
          <div className="flex items-center border-b border-black/6 px-4">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="搜索工具、分类或任务，例如：做 PPT、AI 写作、图像生成"
              className="mb-0 h-14 w-full rounded-none border-none bg-transparent px-3 py-5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="border-b border-black/6 px-4 py-2 text-xs text-slate-500">
            快捷键：<kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">Ctrl/Cmd + K</kbd>
            <span className="mx-2">或</span>
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">Ctrl/Cmd + G</kbd>
          </div>

          <Command.List className="max-h-[60vh] scroll-py-2 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              {search ? "没有找到匹配工具，试试换个任务描述或分类关键词。" : "输入任务或工具名称，快速跳到目录结果。"}
            </Command.Empty>

            {search && (nluIntent.category || nluIntent.price) ? (
              <div className="mb-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                <span className="mr-2 text-slate-500">已识别条件</span>
                {nluIntent.category ? (
                  <span className="mr-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-black/6">
                    分类：{resolveCategoryLabel(categories, nluIntent.category)}
                  </span>
                ) : null}
                {nluIntent.price ? (
                  <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-black/6">
                    价格：{PRICE_LABELS[nluIntent.price] || nluIntent.price}
                  </span>
                ) : null}
              </div>
            ) : null}

            <Command.Group heading={search ? "匹配工具" : "热门工具"}>
              {results.map((tool) => (
                <Command.Item
                  key={tool.slug}
                  value={tool.slug}
                  onSelect={() => handleSelect(tool.slug)}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 text-sm text-slate-900 transition-colors aria-selected:bg-slate-100"
                >
                  {tool.logoPath ? (
                    <img src={tool.logoPath} alt={tool.name} className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      {tool.name[0]}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <div className="truncate font-medium">{tool.name}</div>
                    <div className="truncate text-xs text-slate-500">{tool.summary}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {search ? (
              <Command.Group heading="在完整目录中继续筛选">
                <Command.Item
                  onSelect={handleGlobalSearch}
                  className="mt-2 flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors aria-selected:bg-slate-100"
                >
                  <Search className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">在目录中搜索 “{search}”</span>
                </Command.Item>
              </Command.Group>
            ) : null}
          </Command.List>
        </Command>
      </div>
    </Command.Dialog>
  );
}
