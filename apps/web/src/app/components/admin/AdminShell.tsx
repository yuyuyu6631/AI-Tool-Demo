import Link from "next/link";
import type { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";
import AdminAccessGate from "./AdminAccessGate";

const items = [
  { href: "/admin", label: "总览" },
  { href: "/admin/tools", label: "工具" },
  { href: "/admin/reviews", label: "评论" },
  { href: "/admin/rankings", label: "榜单" },
];

export default function AdminShell({
  currentPath,
  title,
  description,
  children,
}: {
  currentPath: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell">
      <Header currentPath={currentPath} currentRoute={currentPath} />
      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "后台" }]} />
          <section className="panel-base rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${currentPath === item.href ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-6">
            <AdminAccessGate redirectPath={currentPath}>{children}</AdminAccessGate>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
