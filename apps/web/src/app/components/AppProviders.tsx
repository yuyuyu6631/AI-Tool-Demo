"use client";

import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "./auth/AuthProvider";
import { ClientSearchProvider } from "./ClientSearchProvider";
import CommandPalette from "./CommandPalette";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <AuthProvider>
        <ClientSearchProvider>
          {children}
          <CommandPalette />
        </ClientSearchProvider>
      </AuthProvider>
    </NuqsAdapter>
  );
}
