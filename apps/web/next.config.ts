import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const API_REWRITE_BASE_URL =
  (process.env.SERVER_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
const ASSET_PREFIX = (process.env.NEXT_PUBLIC_ASSET_PREFIX || "").replace(/\/+$/, "");

export default function createNextConfig(phase: string): NextConfig {
  return {
    // Keep dev and build outputs separate so `next build` cannot poison the running dev server.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : "standalone",
    basePath: BASE_PATH || undefined,
    assetPrefix: ASSET_PREFIX || undefined,
    async rewrites() {
      const apiRewrites = [
        {
          source: "/api/:path*",
          destination: `${API_REWRITE_BASE_URL}/api/:path*`,
        },
        {
          source: "/health/:path*",
          destination: `${API_REWRITE_BASE_URL}/health/:path*`,
        },
      ];

      if (BASE_PATH) {
        return apiRewrites;
      }

      return [
        {
          source: "/xingdp/api/:path*",
          destination: `${API_REWRITE_BASE_URL}/api/:path*`,
        },
        {
          source: "/xingdp/health/:path*",
          destination: `${API_REWRITE_BASE_URL}/health/:path*`,
        },
        {
          source: "/xingdp/:path*",
          destination: "/:path*",
        },
        ...apiRewrites,
      ];
    },
  };
}
