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
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToAdminDashboard")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            {t("admin.searchQuestion.title")}
          </CardTitle>
          <CardDescription>
            {t("admin.searchQuestion.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlgoliaSearchBar />
        </CardContent>
      </Card>
    </div>
  );
}
