"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { ClipboardList, UserCheck, FileWarning, FileCheck } from "lucide-react";

interface PendingTasksPanelProps {
  pendingQuestions: number;
  pendingUsers: number;
  activeReports: number;
  isLoading?: boolean;
}

export function PendingTasksPanel({
  pendingQuestions,
  pendingUsers,
  activeReports,
  isLoading,
}: PendingTasksPanelProps) {
  const { t } = useTranslation();

  const tasks = [
    {
      count: pendingQuestions,
      labelKey: "admin.dashboard.pendingTasks.reviewQuestions",
      href: "/admin/review-questions",
      icon: FileCheck,
    },
    {
      count: pendingUsers,
      labelKey: "admin.dashboard.pendingTasks.approveUsers",
      href: "/admin/pending-users",
      icon: UserCheck,
    },
    {
      count: activeReports,
      labelKey: "admin.dashboard.pendingTasks.resolveIssues",
      href: "/admin/reported-questions",
      icon: FileWarning,
    },
  ].filter((item) => item.count > 0);

  if (isLoading || tasks.length === 0) return null;

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t("admin.dashboard.pendingTasks.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <Button
              key={task.href}
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start h-auto py-2"
            >
              <Link
                href={task.href}
                aria-label={t(task.labelKey, { count: task.count.toString() })}
              >
                <Icon className="mr-2 h-4 w-4 shrink-0" />
                {t(task.labelKey, { count: task.count.toString() })}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
