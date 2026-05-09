import Link from "next/link";
import { Home, Search } from "lucide-react";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import { withPublicPath } from "@/src/app/lib/public-path";

export default function NotFound() {
  return (
    <div className="page-shell">
      <Header currentPath="/" currentRoute="/" />
      <main className="mx-auto w-full max-w-[960px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="panel-base rounded-[32px] p-8 text-center sm:p-10">
          <p className="eyebrow mb-3 text-xs font-medium">404</p>
          <h1 className="mb-4 text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">页面不存在</h1>
          <p className="glass-copy mx-auto mb-7 max-w-2xl text-sm leading-7">
            这个链接可能已经移动，或者当前页面还没有收录。你可以回到首页重新开始，也可以直接浏览 AI 工具目录。
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={withPublicPath("/")} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition">
              <Home className="h-4 w-4" />
              返回首页
            </Link>
            <Link href={withPublicPath("/tools?view=hot&mode=search&page=1&page_size=24")} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition">
              <Search className="h-4 w-4" />
              浏览工具目录
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
