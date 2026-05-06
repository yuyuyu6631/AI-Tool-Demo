import HeaderAuthControls from "./HeaderAuthControls";
import HeaderMobileMenu from "./HeaderMobileMenu";
import PlatformLogo from "./PlatformLogo";
import { headerNavItems, isHeaderNavActive } from "./header-nav";
import { TOOL_SUBMISSION_URL } from "../lib/catalog-utils";
import { withPublicPath } from "../lib/public-path";

interface HeaderProps {
  currentPath: string;
  currentRoute?: string;
}

export default function Header({ currentPath, currentRoute = currentPath }: HeaderProps) {
  const authHref = withPublicPath(currentPath === "/auth" ? "/auth" : `/auth?next=${encodeURIComponent(withPublicPath(currentRoute))}`);
  const isHome = currentPath === "/";

  return (
    <header className={`site-header sticky top-0 z-50 ${isHome ? "site-header--dark" : ""}`}>
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href={withPublicPath("/")}
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
        >
          <PlatformLogo />
          <div className="hidden min-w-0 sm:block">
            <p className={`text-sm font-semibold tracking-tight ${isHome ? "text-white" : "text-slate-950"}`}>星点评</p>
            <p className={`text-[11px] ${isHome ? "text-sky-100/64" : "text-slate-500"}`}>AI 工具发现</p>
          </div>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="主导航">
          {headerNavItems.map((item) => (
            <a
              key={item.href}
              href={withPublicPath(item.href)}
              aria-current={isHeaderNavActive(currentRoute, item.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                isHeaderNavActive(currentRoute, item.href)
                  ? isHome
                    ? "bg-white/12 text-white"
                    : "bg-slate-950 text-white"
                  : isHome
                    ? "text-sky-50/72 hover:bg-white/10 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={TOOL_SUBMISSION_URL}
            className={`header-utility-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isHome ? "text-slate-100" : "text-slate-800"}`}
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
