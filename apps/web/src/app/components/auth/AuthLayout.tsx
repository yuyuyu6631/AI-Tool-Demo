import type { ReactNode } from "react";
import PlatformLogo from "../PlatformLogo";
import BrandPanel from "./BrandPanel";
import { withPublicPath } from "../../lib/public-path";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="page-shell">
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col">
          <header className="auth-topbar mb-8 flex items-center justify-between gap-4 rounded-[28px] px-4 py-4 sm:px-6">
            <a
              href={withPublicPath("/")}
              className="inline-flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
            >
              <PlatformLogo />
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-950">星点评</p>
                <p className="text-sm text-slate-500">AI 工具点评与发现</p>
              </div>
            </a>

            <a
              href={withPublicPath("/")}
              className="hidden rounded-full border border-white/45 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white sm:inline-flex"
            >
              先去首页找工具
            </a>
          </header>

          <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_500px] lg:items-stretch">
            <BrandPanel />
            <div className="flex items-stretch">{children}</div>
          </section>
        </div>
      </main>
    </div>
  );
}
