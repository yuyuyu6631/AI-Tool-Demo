import Link from "next/link";
import { BadgePercent, Radar, ShieldAlert, Sparkles } from "lucide-react";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import ToolLogo from "@/src/app/components/ToolLogo";
import { fetchDirectory } from "@/src/app/lib/catalog-api";
import { repairDisplayText } from "@/src/app/lib/catalog-utils";
import { detectPriceLabel } from "@/src/app/lib/tool-display";
import { withPublicPath } from "@/src/app/lib/public-path";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [freeDirectory, hotDirectory] = await Promise.all([
    fetchDirectory("mode=search&price=free&page=1&page_size=8").catch(() => null),
    fetchDirectory("mode=search&view=hot&page=1&page_size=8").catch(() => null),
  ]);
  const dealTools = freeDirectory?.items.length ? freeDirectory.items : hotDirectory?.items ?? [];

  return (
    <div className="page-shell">
      <Header currentPath="/deals" currentRoute="/deals" />
      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "免费福利" }]} />

          <section className="overflow-hidden rounded-[32px] border border-slate-900 bg-[#05070f] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] md:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-[#f6c768]/25 bg-[#f6c768]/10 px-3 py-1 text-xs font-semibold text-[#ffe6a6]">
                  <BadgePercent className="h-3.5 w-3.5" />
                  薅羊毛雷达
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">今天能薅什么</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  免费额度、试用、折扣、国内可用和限制风险集中看。先判断值不值得试，再进工具详情。
                </p>
              </div>
              <div className="rounded-2xl border border-sky-300/15 bg-white/[0.055] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-sky-100">福利态势</p>
                  <Radar className="h-5 w-5 text-sky-200" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["免费额度", `${dealTools.length || 0} 条`],
                    ["国内可用", "优先标注"],
                    ["限时活动", "待运营接入"],
                    ["避坑提醒", "详情页核验"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                      <p className="text-[11px] text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-4 md:grid-cols-2">
              {dealTools.map((tool) => (
                <Link key={tool.slug} href={withPublicPath(`/tools/${tool.slug}`)} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <ToolLogo slug={tool.slug} name={repairDisplayText(tool.name)} logoPath={tool.logoPath} size="md" className="border-slate-100 bg-slate-50" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-slate-950">{repairDisplayText(tool.name)}</h2>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          {detectPriceLabel(tool) === "free" ? "免费" : "可试"}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {repairDisplayText(tool.dealSummary || tool.freeAllowanceText || tool.summary || "先用免费版验证核心流程，价格和额度以官网为准。")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <ShieldAlert className="h-4 w-4" />
                  先看限制
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-amber-900/80">
                  <p>免费额度可能有水印、次数、导出、商用授权和地区访问限制。</p>
                  <p>星点评会尽量标注，但最终价格和活动以官网为准。</p>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  运营入口
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  后续可接入厂商活动、私域领取、折扣码和专题页。当前版本先把福利心智和工具详情打通。
                </p>
                <Link href={withPublicPath("/tools?price=free&page=1&page_size=24")} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  查看全部免费工具
                </Link>
              </section>
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
