"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { headerNavItems, isHeaderNavActive } from "./header-nav";

interface HeaderMobileMenuProps {
  currentPath: string;
  authHref: string;
}

export default function HeaderMobileMenu({ currentPath, authHref }: HeaderMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
    } catch {
      // Keep the current UI if logout fails.
    }
  }

  const authLabel = mounted && currentUser ? `账户：${currentUser.username}` : "登录";

  return (
    <>
      <button
        type="button"
        className="header-utility-button rounded-full p-2 md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "关闭导航" : "打开导航"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-t border-black/6 bg-white/92 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 sm:px-6">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  isHeaderNavActive(currentPath, item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100/90"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authHref}
              className="rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100/90"
              onClick={() => setOpen(false)}
            >
              {authLabel}
            </Link>
            {mounted && currentUser?.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100/90"
                onClick={() => setOpen(false)}
              >
                后台
              </Link>
            ) : null}
            {mounted && currentUser ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100/90"
              >
                退出
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
