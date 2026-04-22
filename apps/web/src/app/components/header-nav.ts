export const headerNavItems = [{ href: "/", label: "首页" }] as const;

function normalizeHref(value: string) {
  try {
    const url = new URL(value, "https://example.com");
    return {
      pathname: url.pathname.replace(/\/+$/, "") || "/",
      search: url.search,
    };
  } catch {
    return {
      pathname: value.replace(/\/+$/, "") || "/",
      search: "",
    };
  }
}

export function isHeaderNavActive(currentRoute: string, href: string) {
  const current = normalizeHref(currentRoute);
  const target = normalizeHref(href);

  if (target.pathname === "/") {
    return current.pathname === "/";
  }

  if (current.pathname !== target.pathname && !current.pathname.startsWith(`${target.pathname}/`)) {
    return false;
  }

  if (!target.search) {
    return true;
  }

  return current.search === target.search;
}
