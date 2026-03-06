"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Users, UserCheck, UserSearch, CreditCard, FileWarning, FileEdit, Bell, Mail, FileText, Award, LayoutGrid, Calculator, FileCheck, ClipboardCheck, Sparkles, Database, AlertCircle, ExternalLink, Search, ImagePlus } from 'lucide-react';
import { getAdminSummaryStats } from '@/actions/user-data-actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { PendingTasksPanel } from '@/components/admin/pending-tasks-panel';

const ERROR_MAP: Record<string, string> = {
  "Unauthorized access.": "admin.dashboard.errors.unauthorized",
  "Server configuration error: The Admin SDK is not initialized.": "admin.dashboard.errors.adminSdkNotInit",
};

function getStatStatus(value: number, warningThreshold: number, criticalThreshold: number): "ok" | "warning" | "critical" | undefined {
  if (value >= criticalThreshold) return "critical";
  if (value >= warningThreshold) return "warning";
  return "ok";
}

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setStatsError(null);
      setIsLoadingStats(true);
      getAdminSummaryStats(user.uid)
        .then((statsResult) => {
          if (statsResult.success) {
            setSummaryStats(statsResult.stats);
            setStatsError(null);
          } else {
            setStatsError(statsResult.error || 'Unknown error');
          }
        })
        .catch((error) => {
          console.error("Error fetching admin stats:", error);
          setStatsError(error?.message || 'Failed to load statistics');
        })
        .finally(() => setIsLoadingStats(false));
    });
    return () => unsubscribe();
  }, []);

  const adminSections = [
    {
      titleKey: "admin.dashboard.userManagement.title",
      descriptionKey: "admin.dashboard.userManagement.description",
      icon: Users,
      links: [
        { href: "/admin/pending-users", labelKey: "admin.dashboard.links.pendingUsers", icon: UserCheck },
        { href: "/admin/active-users", labelKey: "admin.dashboard.links.activeUsers", icon: Users },
        { href: "/admin/search-user", labelKey: "admin.dashboard.links.searchUser", icon: UserSearch },
        { href: "/admin/users-by-subscription", labelKey: "admin.dashboard.links.usersBySubscription", icon: CreditCard },
      ],
    },
    {
      titleKey: "admin.dashboard.contentAndIssues.title",
      descriptionKey: "admin.dashboard.contentAndIssues.description",
      icon: FileWarning,
      links: [
        { href: "/admin/search-question", labelKey: "admin.dashboard.links.searchQuestion", icon: Search },
        { href: "/admin/reported-questions", labelKey: "admin.dashboard.links.reportedQuestions", icon: FileWarning },
        { href: "/admin/review-questions", labelKey: "admin.dashboard.links.reviewQuestions", icon: FileCheck },
        { href: "/admin/last-reviewed-questions", labelKey: "admin.dashboard.links.viewLastReviewQuestions", icon: FileCheck },
        { href: "/admin/reviewed-report", labelKey: "admin.dashboard.links.reviewedReport", icon: ClipboardCheck },
        { href: "/admin/enrich-questions", labelKey: "admin.dashboard.links.enrichQuestions", icon: Sparkles },
        { href: "/admin/edit-question", labelKey: "admin.dashboard.links.editQuestion", icon: FileEdit },
      ],
    },
    {
      titleKey: "admin.dashboard.tools.title",
      descriptionKey: "admin.dashboard.tools.description",
      icon: Calculator,
      links: [
        { href: "/admin/nascet-score", labelKey: "admin.dashboard.links.nascetScore", icon: Calculator },
      ],
    },
    {
      titleKey: "admin.dashboard.communication.title",
      descriptionKey: "admin.dashboard.communication.description",
      icon: Mail,
      links: [
        { href: "/admin/sent-notifications", labelKey: "admin.dashboard.links.seeNotifications", icon: Bell },
        { href: "/admin/send-notification", labelKey: "admin.dashboard.links.sendNotification", icon: Mail },
      ],
    },
    {
      titleKey: "admin.dashboard.documentsAndPromotions.title",
      descriptionKey: "admin.dashboard.documentsAndPromotions.description",
      icon: FileText,
      links: [
        { href: "/admin/ecmit", labelKey: "admin.dashboard.links.ecmit", icon: Award },
        { href: "/admin/evaluators", labelKey: "admin.dashboard.links.inviteEvaluators", icon: Users },
      ],
    },
    {
      titleKey: "admin.dashboard.infographics.title",
      descriptionKey: "admin.dashboard.infographics.description",
      icon: ImagePlus,
      links: [
        { href: "/admin/add-infographic", labelKey: "admin.dashboard.links.addInfographic", icon: ImagePlus },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-4">
        <LayoutGrid className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('admin.dashboard.title')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t('admin.dashboard.description')}</p>

      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {ERROR_MAP[statsError]
              ? t(ERROR_MAP[statsError])
              : t('admin.dashboard.stats.statsError', { message: statsError }) || 'Error loading statistics'}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>{ERROR_MAP[statsError] ? t(ERROR_MAP[statsError]) : statsError}</span>
            <Link
              href="/admin/help"
              className="inline-flex items-center gap-1 text-sm underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              aria-label={t('admin.dashboard.errors.seeDocs')}
            >
              {t('admin.dashboard.errors.seeDocs')}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats Row - scroll horizontal on small screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 overflow-x-auto pb-2">
        <StatCard
          title={t('admin.dashboard.stats.totalQuestions')}
          value={isLoadingStats ? "..." : (summaryStats?.totalQuestions || 0)}
          icon={Database}
          labelContext={t('admin.dashboard.stats.labelAllTime')}
          className="shadow-sm border-primary/10 dark:border-primary/20 min-w-[140px]"
          isLoading={isLoadingStats}
          aria-label={t('admin.dashboard.stats.totalQuestions')}
        />
        <StatCard
          title={t('admin.dashboard.stats.pendingReview')}
          value={isLoadingStats ? "..." : (summaryStats?.pendingQuestions || 0)}
          icon={FileCheck}
          href="/admin/review-questions"
          description={t('admin.dashboard.stats.reviewedLabel', { count: (summaryStats?.reviewedQuestions || 0).toString() })}
          status={getStatStatus(summaryStats?.pendingQuestions ?? 0, 10, 50)}
          className="shadow-sm border-orange-300 bg-orange-50/40 dark:border-orange-800 dark:bg-orange-950/30 min-w-[140px]"
          isLoading={isLoadingStats}
          aria-label={t('admin.dashboard.stats.pendingReview')}
        />
        <StatCard
          title={t('admin.dashboard.stats.pendingUsers')}
          value={isLoadingStats ? "..." : (summaryStats?.pendingUsers || 0)}
          icon={UserCheck}
          href="/admin/pending-users"
          labelContext={(summaryStats?.pendingUsers ?? 0) > 0 ? t('admin.dashboard.stats.labelNeedsAttention') : undefined}
          status={getStatStatus(summaryStats?.pendingUsers ?? 0, 1, 5)}
          className="shadow-sm border-blue-300 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/30 min-w-[140px]"
          isLoading={isLoadingStats}
          aria-label={t('admin.dashboard.stats.pendingUsers')}
        />
        <StatCard
          title={t('admin.dashboard.stats.activeIssues')}
          value={isLoadingStats ? "..." : (summaryStats?.activeReports || 0)}
          icon={AlertCircle}
          href="/admin/reported-questions"
          labelContext={(summaryStats?.activeReports ?? 0) > 0 ? t('admin.dashboard.stats.labelNeedsAttention') : undefined}
          status={getStatStatus(summaryStats?.activeReports ?? 0, 1, 5)}
          className="shadow-sm border-red-300 bg-red-50/40 dark:border-red-800 dark:bg-red-950/30 min-w-[140px]"
          isLoading={isLoadingStats}
          aria-label={t('admin.dashboard.stats.activeIssues')}
        />
      </div>

      <div className="mb-8">
        <PendingTasksPanel
          pendingQuestions={summaryStats?.pendingQuestions ?? 0}
          pendingUsers={summaryStats?.pendingUsers ?? 0}
          activeReports={summaryStats?.activeReports ?? 0}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Sections - Cards on desktop */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
        {adminSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <Card key={section.titleKey} className="shadow-lg overflow-hidden transition-shadow hover:shadow-xl border-primary/20 ring-1 ring-primary/5">
              <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  {t(section.titleKey)}
                </CardTitle>
                {section.descriptionKey && (
                  <CardDescription className="mt-1.5">
                    {t(section.descriptionKey)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                {section.links.map(link => {
                  const LinkIcon = link.icon;
                  const label = t(link.labelKey);
                  return (
                    <Button
                      asChild
                      key={link.href}
                      variant="outline"
                      className="h-auto min-h-[44px] justify-start whitespace-normal text-left px-4 py-3 rounded-lg border-border/80 transition-all hover:border-primary/40 hover:bg-primary/5 group"
                    >
                      <Link href={link.href} aria-label={label} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/80 group-hover:bg-primary/10 transition-colors">
                          <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" aria-hidden />
                        </div>
                        <span className="font-medium">{label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sections - Accordion on mobile */}
      <div className="md:hidden">
        <Accordion type="single" collapsible className="w-full">
          {adminSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <AccordionItem key={section.titleKey} value={section.titleKey} className="border-primary/20">
                <AccordionTrigger className="hover:no-underline py-4 bg-primary/5">
                  <span className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    {t(section.titleKey)}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {section.descriptionKey && (
                    <p className="text-sm text-muted-foreground mb-4">{t(section.descriptionKey)}</p>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {section.links.map(link => {
                      const LinkIcon = link.icon;
                      const label = t(link.labelKey);
                      return (
                        <Button asChild key={link.href!} variant="outline" size="sm" className="justify-start h-11 rounded-lg">
                          <Link href={link.href!} aria-label={label} className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 shrink-0" aria-hidden />
                            {label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
