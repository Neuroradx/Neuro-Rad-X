"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LanguageProvider } from "./language-provider";
import { Toaster } from "@/components/ui/toaster";
import { SyncHtmlLang } from "@/components/common/sync-html-lang";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <SyncHtmlLang />
        {children}
        <Toaster />
      </LanguageProvider>
    </NextThemesProvider>
  );
}
