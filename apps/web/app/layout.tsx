import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import AppProviders from "@/src/app/components/AppProviders";
import RouteFeedback from "@/src/app/components/RouteFeedback";
import FloatingChatBot from "@/src/app/components/chat/FloatingChatBot";
import { withPublicPath } from "@/src/app/lib/public-path";
import "./globals.css";

export const metadata: Metadata = {
  title: "星点评",
  description: "帮助用户发现、比较和选择 AI 工具的点评与发现平台。",
  icons: {
    icon: withPublicPath("/brand/logo.png"),
    shortcut: withPublicPath("/brand/logo.png"),
    apple: withPublicPath("/brand/logo.png"),
  },
};

import { ViewTransitions } from "next-view-transitions";

const themeBootstrapScript = `
(() => {
  try {
    const key = "xingdianping-theme";
    const stored = window.localStorage.getItem(key);
    const mode = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = mode;
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.style.colorScheme = mode;
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="zh-CN" data-theme="dark" className="dark" suppressHydrationWarning>
        <body>
          <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
          <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none opacity-0">
            <defs>
              <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          <AppProviders>
            <Suspense fallback={null}>
              <RouteFeedback />
            </Suspense>
            {children}
          </AppProviders>
          <Suspense fallback={null}>
            <FloatingChatBot />
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  );
}
