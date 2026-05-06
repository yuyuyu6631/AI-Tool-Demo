import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCatalogReturnLabel,
  getRememberedCatalogRoute,
  getRememberedCatalogSnapshot,
  markCatalogScrollRestore,
  rememberCatalogNavigation,
  rememberCatalogSnapshot,
  restoreCatalogScroll,
} from "../catalog-navigation";

describe("catalog-navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("remembers the active route and scroll position", () => {
    Object.defineProperty(window, "scrollY", { value: 368, configurable: true });

    rememberCatalogNavigation("/?q=writing&page=2");

    expect(getRememberedCatalogRoute()).toBe("/?q=writing&page=2");
    expect(window.sessionStorage.getItem("catalog:return-scroll")).toBe("368");
  });

  it("classifies remembered routes for user-facing labels", () => {
    expect(getCatalogReturnLabel("/")).toBe("\u8fd4\u56de\u9996\u9875");
    expect(getCatalogReturnLabel("/?q=writing&page=2")).toBe("\u8fd4\u56de\u641c\u7d22\u7ed3\u679c");
    expect(getCatalogReturnLabel("/?category=design&page=1")).toBe("\u8fd4\u56de\u7b5b\u9009\u7ed3\u679c");
    expect(getCatalogReturnLabel("/scenarios/marketing")).toBe("\u8fd4\u56de\u573a\u666f");
    expect(getCatalogReturnLabel("/compare/chatgpt-vs-claude")).toBe("\u8fd4\u56de\u5bf9\u6bd4\u9875");
  });

  it("marks and restores the saved scroll position", () => {
    const scrollToMock = vi.fn();
    const rafMock = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("requestAnimationFrame", rafMock);

    window.sessionStorage.setItem("catalog:return-scroll", "368");
    markCatalogScrollRestore();

    expect(window.sessionStorage.getItem("catalog:restore-scroll")).toBe("368");

    restoreCatalogScroll();

    expect(scrollToMock).toHaveBeenCalledWith({ top: 368, behavior: "auto" });
    expect(window.sessionStorage.getItem("catalog:restore-scroll")).toBeNull();
  });

  it("remembers route snapshots and drops expired entries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-28T08:00:00Z"));

    rememberCatalogSnapshot("/?mode=ai&q=ppt&page=1", { total: 2 });

    expect(getRememberedCatalogSnapshot<{ total: number }>("/?mode=ai&q=ppt&page=1")).toEqual({ total: 2 });

    vi.setSystemTime(new Date("2026-04-28T08:11:00Z"));

    expect(getRememberedCatalogSnapshot<{ total: number }>("/?mode=ai&q=ppt&page=1")).toBeNull();
  });
});
