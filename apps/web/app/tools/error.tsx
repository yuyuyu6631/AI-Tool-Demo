"use client";

import Link from "next/link";
import { RotateCcw, Search } from "lucide-react";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import { withPublicPath } from "@/src/app/lib/public-path";

export default function ToolsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <Header currentPath="/tools" currentRoute="/tools" />
      <main className="mx-auto w-full max-w-[960px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <section className="panel-base rounded-[28px] p-8 sm:p-10">
          <p className="eyebrow mb-3 text-xs font-medium">工具页面加载失败</p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">暂时没能拿到工具信息</h1>
          <p className="glass-copy mx-auto mt-4 max-w-2xl text-sm leading-7">
            可能是网络或数据服务短暂异常。你可以重试，或先查看热门工具列表。
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              <RotateCcw className="h-4 w-4" />
              重试
            </button>
            <Link href={withPublicPath("/tools?view=hot&mode=search&page=1&page_size=24")} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              <Search className="h-4 w-4" />
              热门工具
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
