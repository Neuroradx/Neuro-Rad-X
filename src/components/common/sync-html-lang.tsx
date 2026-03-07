"use client";

import { useContext, useEffect } from "react";
import { LanguageContext } from "@/providers/language-provider";

/**
 * Syncs the app language from LanguageProvider to the document's lang attribute
 * for accessibility and SEO. Rendered inside Providers so it has access to context.
 */
export function SyncHtmlLang() {
  const context = useContext(LanguageContext);

  useEffect(() => {
    if (context?.language) {
      document.documentElement.setAttribute("lang", context.language);
    }
  }, [context?.language]);

  return null;
}
