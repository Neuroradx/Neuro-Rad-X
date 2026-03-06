"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { AlgoliaSearchBar } from "@/components/questions/AlgoliaSearchBar";

export default function SearchQuestionPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button asChild variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToAdminDashboard")}
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.searchQuestion.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("admin.searchQuestion.description")}</p>
        </div>
      </div>

      <Card className="rounded-xl border-border/80 shadow-lg">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <CardTitle>{t("admin.searchQuestion.title")}</CardTitle>
          <CardDescription>{t("admin.searchQuestion.description")}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-visible">
          <AlgoliaSearchBar variant="inline" />
        </CardContent>
      </Card>
    </div>
  );
}
