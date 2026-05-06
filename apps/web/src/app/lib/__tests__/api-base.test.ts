import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApiUrl } from "../api-base";

const ORIGINAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ORIGINAL_API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH;

describe("buildApiUrl", () => {
  afterEach(() => {
    if (ORIGINAL_API_BASE_URL === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_API_BASE_URL;
    if (ORIGINAL_API_BASE_PATH === undefined) delete process.env.NEXT_PUBLIC_API_BASE_PATH;
    else process.env.NEXT_PUBLIC_API_BASE_PATH = ORIGINAL_API_BASE_PATH;
    vi.unstubAllGlobals();
  });

  it("uses the configured API host during local development", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://192.168.8.113:8000";
    vi.stubGlobal("window", {
      location: {
        hostname: "localhost",
        origin: "http://localhost:3000",
        pathname: "/",
      },
    });

    expect(buildApiUrl("/api/tools/search-index")).toBe("http://192.168.8.113:8000/api/tools/search-index");
  });

  it("keeps public xingdp traffic on the current origin instead of a private API host", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://192.168.8.113:8000";
    vi.stubGlobal("window", {
      location: {
        hostname: "changsha.01view.ydns.eu",
        origin: "http://changsha.01view.ydns.eu:12318",
        pathname: "/xingdp/",
      },
    });

    expect(buildApiUrl("/api/tools/search-index")).toBe(
      "http://changsha.01view.ydns.eu:12318/xingdp/api/tools/search-index",
    );
  });

  it("uses an explicit public API base path when configured", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://192.168.8.113:8000";
    process.env.NEXT_PUBLIC_API_BASE_PATH = "/xingdp";
    vi.stubGlobal("window", {
      location: {
        hostname: "changsha.01view.ydns.eu",
        origin: "http://changsha.01view.ydns.eu:12318",
        pathname: "/",
      },
    });

    expect(buildApiUrl("api/categories")).toBe("http://changsha.01view.ydns.eu:12318/xingdp/api/categories");
  });
});
