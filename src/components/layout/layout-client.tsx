"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

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

  return useAppShell ? <AppShell>{children}</AppShell> : <>{children}</>;
}
