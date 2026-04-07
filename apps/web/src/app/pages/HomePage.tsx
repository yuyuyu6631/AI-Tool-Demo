import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import type { PresetView, ScenarioSummary, ToolSummary } from "../lib/catalog-types";
import { buildDecisionBadges, buildToolsHref } from "../lib/catalog-utils";

interface HomePageProps {
  featuredTools: ToolSummary[];
  categories: Array<{ slug: string; label: string; count: number }>;
  presets: PresetView[];
  audienceScenarios: ScenarioSummary[];
}

const quickSearches = [
  { label: "写文案", query: "写文案" },
  { label: "做海报", query: "做海报" },
  { label: "写代码", query: "写代码" },
  { label: "做数据", query: "做数据" },
];

function detectPriceLabel(tool: ToolSummary) {
  const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
  if (text.includes("免费") || text.includes("free")) return "free";
  if (text.includes("免费增值") || text.includes("freemium")) return "freemium";
  if (text.includes("订阅") || text.includes("月付") || text.includes("yearly") || text.includes("monthly")) return "subscription";
  if (text.includes("付费") || text.includes("一次性") || text.includes("lifetime")) return "one-time";
  return null;
}

export default function HomePage({ featuredTools, categories, presets, audienceScenarios }: HomePageProps) {
  return (
    <div className="page-shell">
      <Header currentPath="/" currentRoute="/" />

      <main>
        <section className="hero-shell border-b border-white/25 py-16 md:py-20">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_440px] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI 工具点评与发现平台</p>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                  不是找链接，而是选对 AI 工具
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                  围绕任务、成本、访问条件和可信度，帮助你更快缩小选择范围，再决定哪一个工具值得继续使用。
                </p>

                <form action="/tools" method="get" className="mt-8">
                  <div className="search-panel rounded-[32px] p-4 md:p-5">
                    <div className="relative z-10 flex flex-col gap-3 md:flex-row">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          name="q"
                          placeholder="想写文案、做海报、写代码？直接告诉我你的任务。"
                          className="w-full rounded-[22px] border border-white/45 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
                        />
                      </div>
                      <button type="submit" className="btn-primary rounded-[22px] px-6 py-4 text-sm font-semibold">
                        开始筛选
                      </button>
                    </div>

                    <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                      {quickSearches.map((item) => (
                        <Link
                          key={item.label}
                          href={buildToolsHref({}, { q: item.query })}
                          className="rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <p className="relative z-10 mt-4 text-xs leading-6 text-slate-500">
                      先说需求，再看工具。你也可以按最新、最热、免费优先、场景和人群标签继续缩小范围。
                    </p>
                  </div>
                </form>
              </div>

              <div className="panel-base rounded-[32px] p-6 md:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">快速决策</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">先看能帮你缩小范围的入口</h2>
                  </div>
                  <Link href="/tools" className="hidden text-sm font-medium text-slate-900 hover:underline sm:inline-flex">
                    去目录
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {presets.slice(0, 4).map((preset) => (
                    <Link
                      key={preset.id}
                      href={buildToolsHref({}, { view: preset.id })}
                      className="rounded-[24px] border border-white/40 bg-white/60 p-4 transition hover:bg-white/85"
                    >
                      <p className="text-sm font-semibold text-slate-900">{preset.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{preset.description}</p>
                      <p className="mt-3 text-xs font-medium text-slate-500">{preset.count} 个结果</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">常用分类</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">先按任务方向缩小范围，再进入详情比较，效率会比直接看一堆链接高很多。</p>
              </div>
              <Link href="/tools" className="hidden text-sm font-medium text-slate-900 hover:underline md:inline-flex">
                查看全部
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.slug}
                  href={buildToolsHref({}, { category: category.slug, page: 1 })}
                  className="card-base rounded-[28px] p-5"
                >
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-slate-950">{category.label}</p>
                    <p className="mt-3 text-sm text-slate-500">{category.count} 个工具</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                      进入分类
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">按人群和场景选</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  按真实人群和使用场景组织工具入口，让用户不是先看分类名词，而是先找到适合自己的选择。
                </p>
              </div>
              <Link href="/scenarios" className="hidden text-sm font-medium text-slate-900 hover:underline md:inline-flex">
                查看更多场景
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {audienceScenarios.map((scenario) => (
                <Link key={scenario.slug} href={`/scenarios/${scenario.slug}`} className="card-base rounded-[28px] p-5">
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{scenario.toolCount} 个工具</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{scenario.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{scenario.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {scenario.targetAudience.slice(0, 3).map((audience) => (
                        <span key={audience} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">精选推荐工具</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">优先展示更值得进入下一步比较的工具，先缩小范围，再看细节。</p>
              </div>
              <Link href="/tools?view=hot" className="text-sm font-medium text-slate-900 hover:underline">
                查看全部
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredTools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  slug={tool.slug}
                  name={tool.name}
                  summary={tool.summary}
                  tags={tool.tags}
                  url={tool.officialUrl}
                  logoPath={tool.logoPath}
                  score={tool.score}
                  priceLabel={detectPriceLabel(tool)}
                  decisionBadges={buildDecisionBadges({ price: tool.price, summary: tool.summary, tags: tool.tags })}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
