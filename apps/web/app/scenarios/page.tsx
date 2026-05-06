import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import { fetchScenarios } from "@/src/app/lib/catalog-api";
import { TOOL_SUBMISSION_URL } from "@/src/app/lib/catalog-utils";
import { FEATURED_SCENARIOS } from "@/src/app/lib/featured-scenarios";
import { withPublicPath } from "@/src/app/lib/public-path";

export const dynamic = "force-dynamic";

export default async function Page() {
  const scenarios = await fetchScenarios().catch(() => []);
  const scenarioCounts = new Map(scenarios.map((scenario) => [scenario.slug, scenario.toolCount]));
  const otherScenarios = scenarios.filter((scenario) => !FEATURED_SCENARIOS.some((featured) => featured.slug === scenario.slug));

  return (
    <div className="page-shell">
      <Header currentPath="/scenarios" currentRoute="/scenarios" />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "场景" }]} />

          <section className="panel-base rounded-[28px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">推荐场景</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">按真实任务选择 AI 工具</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  先看任务流程，再选工具。这里优先支撑 PPT、论文排版和 Excel 分析三个高频场景，避免只靠关键词搜索来回试。
                </p>
              </div>
              <Link href={withPublicPath("/tools?mode=search&page=1&page_size=24")} className="btn-secondary rounded px-4 py-2.5 text-sm">
                全部工具库
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            {FEATURED_SCENARIOS.map((scenario) => (
              <Link
                key={scenario.slug}
                href={withPublicPath(`/scenarios/${scenario.slug}`)}
                className="group card-base rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {scenarioCounts.get(scenario.slug) || "推荐"} 个工具
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{scenario.title}</h2>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{scenario.description}</p>
                <div className="mt-4 space-y-2">
                  {scenario.workflow.slice(0, 2).map((step, index) => (
                    <div key={step.title} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">步骤 {index + 1}</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{step.title}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">继续浏览工具数据</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">直接进入第二页或打开完整工具库，适合快速检查 2000+ 条数据的后续内容。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={withPublicPath("/tools?page=2&page_size=24")} className="btn-primary rounded px-4 py-2.5 text-sm">
                  下一页
                </Link>
                <Link href={withPublicPath("/tools?mode=search&page=1&page_size=24")} className="btn-secondary rounded px-4 py-2.5 text-sm">
                  全部数据快速入口
                </Link>
              </div>
            </div>
          </section>

          {otherScenarios.length > 0 ? (
            <section className="mt-6 grid gap-4 md:grid-cols-2">
              {otherScenarios.map((scenario) => (
                <Link key={scenario.slug} href={withPublicPath(`/scenarios/${scenario.slug}`)} className="card-base rounded-lg p-5">
                  <p className="text-xs font-semibold text-slate-500">{scenario.toolCount} 个工具</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">{scenario.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{scenario.description}</p>
                </Link>
              ))}
            </section>
          ) : null}

          {scenarios.length === 0 ? (
            <section className="panel-base mt-6 rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900">后端场景数据还在补充中</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                当前三类核心场景已由前端兜底展示。你也可以提交常用工具，后续补进对应场景。
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href={withPublicPath("/tools?mode=search&page=1&page_size=24")} className="btn-primary rounded px-5 py-3 text-sm">
                  去工具库
                </Link>
                <Link href={TOOL_SUBMISSION_URL} className="btn-secondary rounded px-5 py-3 text-sm">
                  提交工具
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
