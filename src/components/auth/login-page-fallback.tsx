"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Loader2 } from "lucide-react";

export function LoginPageFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">{t("auth.loadingForm")}</p>
    </div>
  );
}
