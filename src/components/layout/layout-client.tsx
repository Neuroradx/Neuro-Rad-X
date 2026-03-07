"use client";

import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { hasFirebaseConfig } from "@/lib/env";

const AppShell = hasFirebaseConfig
  ? (dynamic(
      () => import("@/components/layout/app-shell").then((m) => m.AppShell),
      { ssr: true }
    ) as React.ComponentType<{ children: React.ReactNode }>)
  : null;

const simpleLayoutRoutes = [
  "/auth",
  "/about",
  "/impressum",
  "/privacy-policy",
  "/terms-of-use",
  "/view-infographics",
];

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSimpleRoute =
    pathname === "/" ||
    simpleLayoutRoutes.some((prefix) => pathname.startsWith(prefix));
  const useAppShell = !isSimpleRoute;

  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }

  const Shell = AppShell;
  return useAppShell && Shell != null ? <Shell>{children}</Shell> : <>{children}</>;
}
