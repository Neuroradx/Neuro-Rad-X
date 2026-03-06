"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function AdminHelpPage() {
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
            <BookOpen className="h-6 w-6 text-primary" />
            {t("admin.dashboard.errors.seeDocs")}
          </CardTitle>
          <CardDescription>
            {t("admin.help.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-1">
              {t("admin.help.unauthorizedTitle")}
            </h3>
            <p>{t("admin.help.unauthorizedDesc")}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">
              {t("admin.help.adminSdkTitle")}
            </h3>
            <p>{t("admin.help.adminSdkDesc")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
