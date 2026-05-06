import Link from "next/link";
import { ArrowRight, Mic, Search, Sparkles } from "lucide-react";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import { inferTaskScenes, TASK_SCENES } from "@/src/app/lib/task-scenes";
import { withPublicPath } from "@/src/app/lib/public-path";

interface SearchRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}

export default async function Page({ searchParams }: SearchRouteProps) {
  const params = await searchParams;
  const task = readValue(params.task).trim();
  const scenes = task ? inferTaskScenes(task) : TASK_SCENES.slice(0, 6);

  return (
    <div className="page-shell">
      <Header currentPath="/search" currentRoute={`/search${task ? `?task=${encodeURIComponent(task)}` : ""}`} />
      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "按任务找" }]} />

          <section className="overflow-hidden rounded-[32px] border border-slate-900 bg-[#05070f] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] md:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  语义搜索
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                  {task ? `我理解你要做：${task}` : "把任务说清楚，再看工具"}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  这里不直接丢工具详情。先判断任务类型、拆步骤，再进入对应场景页和推荐列表。
                </p>
              </div>

              <form action={withPublicPath("/search")} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-100/70" />
                  <input
                    name="task"
                    type="search"
                    defaultValue={task}
                    data-global-search-target="search"
                    placeholder="比如：小红书封面图 / 课程汇报 PPT / Python 报错"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#f6c768]/70 focus:shadow-[0_0_24px_rgba(56,189,248,0.18)]"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#38bdf8_0%,#f6c768_100%)] px-4 text-sm font-semibold text-slate-950">
                    重新拆一下
                  </button>
                  <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-sky-100" aria-label="语音输入占位">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {scenes.map((scene) => (
                <Link key={scene.slug} href={withPublicPath(`/scene/${scene.slug}`)} className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">推荐场景</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950">{scene.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{scene.warning}</p>
                    </div>
                    <ArrowRight className="mt-2 h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scene.next.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">搜索页只做一件事</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>01 先理解你要完成什么任务。</p>
                <p>02 拆成几个真实步骤，避免一上来乱选工具。</p>
                <p>03 再进入场景页，看工具推荐和避坑。</p>
              </div>
              <Link href={withPublicPath("/tools?mode=search&page=1&page_size=24")} className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                我知道工具类型，直接去工具库
              </Link>
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
