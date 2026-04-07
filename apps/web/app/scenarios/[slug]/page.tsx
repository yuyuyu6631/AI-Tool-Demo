import { notFound } from "next/navigation";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import ToolCard from "@/src/app/components/ToolCard";
import { fetchScenarioDetail } from "@/src/app/lib/catalog-api";
import type { ToolSummary } from "@/src/app/lib/catalog-types";
import { buildDecisionBadges } from "@/src/app/lib/catalog-utils";

interface ScenarioRouteProps {
  params: Promise<{ slug: string }>;
}

function detectPriceLabel(tool: ToolSummary) {
  const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
  if (text.includes("免费") || text.includes("free")) return "free";
  if (text.includes("免费增值") || text.includes("freemium")) return "freemium";
  if (text.includes("订阅") || text.includes("月付") || text.includes("yearly") || text.includes("monthly")) return "subscription";
  if (text.includes("付费") || text.includes("一次性") || text.includes("lifetime")) return "one-time";
  return null;
}

export default async function Page({ params }: ScenarioRouteProps) {
  const { slug } = await params;
  const scenario = await fetchScenarioDetail(slug);

  if (!scenario) {
    notFound();
  }

  const renderToolsGrid = (tools: ToolSummary[], title: string) => (
    <div className="panel-base rounded-[28px] p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {tools.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-1 xl:grid-cols-1">
          {tools.map((tool) => (
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
      ) : (
        <p className="mt-4 text-sm text-slate-500">暂无可展示工具。</p>
      )}
    </div>
  );

  return (
    <div className="page-shell">
      <Header currentPath={`/scenarios/${slug}`} currentRoute={`/scenarios/${slug}`} />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", href: "/" },
              { label: "场景", href: "/scenarios" },
              { label: scenario.title },
            ]}
          />

          <section className="panel-base rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">场景</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{scenario.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{scenario.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {scenario.targetAudience.map((audience) => (
                <span key={audience} className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {audience}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="panel-base rounded-[28px] p-6">
              <h2 className="text-xl font-semibold text-slate-900">要解决的核心问题</h2>
              <p className="mt-4 text-sm leading-8 text-slate-700">{scenario.problem}</p>
            </div>
          </section>

          {scenario.primaryTools.length > 0 ? <section className="mt-6">{renderToolsGrid(scenario.primaryTools, "优先推荐工具")}</section> : null}

          {scenario.alternativeTools.length > 0 ? <section className="mt-6">{renderToolsGrid(scenario.alternativeTools, "备选工具")}</section> : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
