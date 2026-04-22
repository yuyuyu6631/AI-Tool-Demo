import Link from "next/link";
import HeaderAuthControls from "./HeaderAuthControls";
import HeaderMobileMenu from "./HeaderMobileMenu";
import PlatformLogo from "./PlatformLogo";
import { headerNavItems, isHeaderNavActive } from "./header-nav";
import { TOOL_SUBMISSION_URL } from "../lib/catalog-utils";

interface HeaderProps {
  currentPath: string;
  currentRoute?: string;
}

export default function Header({ currentPath, currentRoute = currentPath }: HeaderProps) {
  const authHref = currentPath === "/auth" ? "/auth" : `/auth?next=${encodeURIComponent(currentRoute)}`;

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
        >
          <PlatformLogo />
          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-semibold tracking-tight text-slate-950">星点评</p>
            <p className="text-[11px] text-slate-500">AI 工具发现</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {headerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link text-sm font-medium transition ${
                isHeaderNavActive(currentRoute, item.href) ? "is-active text-slate-950" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={TOOL_SUBMISSION_URL}
            target="_blank"
            rel="noreferrer"
            className="header-utility-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-800"
          >
            提交工具
          </a>
          <HeaderAuthControls authHref={authHref} />
        </div>

        <HeaderMobileMenu currentPath={currentPath} authHref={authHref} />
      </div>
    </header>
  );
}
