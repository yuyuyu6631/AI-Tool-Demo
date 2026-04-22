const RETURN_ROUTE_KEY = "catalog:return-route";
const RETURN_SCROLL_KEY = "catalog:return-scroll";
const RESTORE_MARKER_KEY = "catalog:restore-scroll";

const RETURN_LABELS = {
  previous: "\u8fd4\u56de\u4e0a\u4e00\u9875",
  scenarios: "\u8fd4\u56de\u573a\u666f",
  compare: "\u8fd4\u56de\u5bf9\u6bd4\u9875",
  searchResults: "\u8fd4\u56de\u641c\u7d22\u7ed3\u679c",
  filteredResults: "\u8fd4\u56de\u7b5b\u9009\u7ed3\u679c",
  home: "\u8fd4\u56de\u9996\u9875",
  resultList: "\u8fd4\u56de\u7ed3\u679c\u5217\u8868",
  tools: "\u8fd4\u56de\u5de5\u5177\u76ee\u5f55",
} as const;

function parseCatalogRoute(route: string) {
  try {
    const url = new URL(route, "https://example.com");
    return {
      pathname: url.pathname.replace(/\/+$/, "") || "/",
      searchParams: url.searchParams,
    };
  } catch {
    const [pathnamePart, searchPart = ""] = route.split("?");
    return {
      pathname: pathnamePart.replace(/\/+$/, "") || "/",
      searchParams: new URLSearchParams(searchPart),
    };
  }
}

export function rememberCatalogNavigation(route?: string) {
  if (typeof window === "undefined") return;

  const nextRoute = route || `${window.location.pathname}${window.location.search}`;
  window.sessionStorage.setItem(RETURN_ROUTE_KEY, nextRoute);
  window.sessionStorage.setItem(RETURN_SCROLL_KEY, String(window.scrollY));
}

export function getRememberedCatalogRoute(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  return window.sessionStorage.getItem(RETURN_ROUTE_KEY) || fallback;
}

export function getCatalogReturnLabel(route: string, fallback = RETURN_LABELS.previous) {
  const { pathname, searchParams } = parseCatalogRoute(route);

  if (pathname.startsWith("/scenarios/")) {
    return RETURN_LABELS.scenarios;
  }

  if (pathname.startsWith("/compare/")) {
    return RETURN_LABELS.compare;
  }

  if (pathname === "/") {
    if (searchParams.toString()) {
      return searchParams.has("q") ? RETURN_LABELS.searchResults : RETURN_LABELS.filteredResults;
    }
    return RETURN_LABELS.home;
  }

  if (pathname.startsWith("/tools")) {
    return searchParams.toString() ? RETURN_LABELS.resultList : RETURN_LABELS.tools;
  }

  return fallback;
}

export function markCatalogScrollRestore() {
  if (typeof window === "undefined") return;
  const scroll = window.sessionStorage.getItem(RETURN_SCROLL_KEY);
  if (scroll) {
    window.sessionStorage.setItem(RESTORE_MARKER_KEY, scroll);
  }
}

export function restoreCatalogScroll() {
  if (typeof window === "undefined") return;

  const stored = window.sessionStorage.getItem(RESTORE_MARKER_KEY);
  if (!stored) return;

  const top = Number.parseInt(stored, 10);
  if (!Number.isNaN(top)) {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "auto" });
    });
  }

  window.sessionStorage.removeItem(RESTORE_MARKER_KEY);
}
