const PUBLIC_BASE_PATH = (
  process.env.NEXT_PUBLIC_PUBLIC_BASE_PATH
  || process.env.NEXT_PUBLIC_BASE_PATH
  || process.env.NEXT_PUBLIC_ASSET_PREFIX
  || ""
).replace(/\/+$/, "");

export function withPublicPath(href: string) {
  if (!PUBLIC_BASE_PATH) return href;
  if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  if (href.startsWith("#")) return href;
  if (href === PUBLIC_BASE_PATH || href.startsWith(`${PUBLIC_BASE_PATH}/`) || href.startsWith(`${PUBLIC_BASE_PATH}?`)) {
    return href;
  }
  if (href === "/") return `${PUBLIC_BASE_PATH}/`;
  if (href.startsWith("/#")) return `${PUBLIC_BASE_PATH}/${href.slice(1)}`;
  if (href.startsWith("?")) return `${PUBLIC_BASE_PATH}/${href}`;
  if (href.startsWith("/")) return `${PUBLIC_BASE_PATH}${href}`;
  return `${PUBLIC_BASE_PATH}/${href}`;
}

export function withoutPublicPath(pathname: string) {
  if (!PUBLIC_BASE_PATH) return pathname;
  if (pathname === PUBLIC_BASE_PATH) return "/";
  if (pathname.startsWith(`${PUBLIC_BASE_PATH}/`)) return pathname.slice(PUBLIC_BASE_PATH.length) || "/";
  return pathname;
}
