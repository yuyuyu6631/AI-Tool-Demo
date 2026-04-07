export const headerNavItems = [
  { href: "/", label: "首页" },
  { href: "/tools", label: "工具目录" },
  { href: "/rankings", label: "榜单" },
  { href: "/scenarios", label: "场景" },
] as const;

export function isHeaderNavActive(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
