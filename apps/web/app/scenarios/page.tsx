import Link from "next/link";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import { fetchScenarios } from "@/src/app/lib/catalog-api";

export default async function Page() {
  const scenarios = await fetchScenarios().catch(() => []);

  return (
    <div className="page-shell">
      <Header currentPath="/scenarios" currentRoute="/scenarios" />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "场景" }]} />

          <section className="panel-base rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">场景</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">按真实人群和场景找工具</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              很多用户更关心“我现在要完成什么任务”，而不是先记住一长串工具分类。这里按真实使用场景组织入口。
            </p>
          </section>

          {scenarios.length === 0 ? (
            <section className="panel-base mt-6 rounded-[28px] p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900">暂无可展示场景</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">当前没有可用场景数据，稍后再试。</p>
            </section>
          ) : (
            <section className="mt-6 grid gap-4 md:grid-cols-2">
              {scenarios.map((scenario) => (
                <Link key={scenario.slug} href={`/scenarios/${scenario.slug}`} className="card-base rounded-[28px] p-5">
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{scenario.toolCount} 个工具</p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{scenario.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{scenario.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {scenario.targetAudience.slice(0, 4).map((audience) => (
                        <span key={audience} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
