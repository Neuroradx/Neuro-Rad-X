"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Users, UserCheck, UserSearch, CreditCard, FileWarning, FileEdit, Bell, Mail, FileText, Award, LayoutGrid, Calculator, FileCheck, ClipboardCheck, Sparkles, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { getAdminSummaryStats } from '@/actions/user-data-actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { AlgoliaSearchBar } from '@/components/questions/AlgoliaSearchBar';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsLoadingStats(true);
      getAdminSummaryStats(user.uid).then((statsResult) => {
        if (statsResult.success) {
          setSummaryStats(statsResult.stats);
        }
        setIsLoadingStats(false);
      }).catch(error => {
        console.error("Error fetching admin stats:", error);
        setIsLoadingStats(false);
      });
    }
  }, []);

  const adminSections = [
    {
      titleKey: "admin.dashboard.userManagement.title",
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
      icon: FileWarning,
      links: [
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
      icon: Calculator,
      links: [
        { href: "/admin/nascet-score", labelKey: "admin.dashboard.links.nascetScore", icon: Calculator },
      ],
    },
    {
      titleKey: "admin.dashboard.communication.title",
      icon: Mail,
      links: [
        { href: "/admin/sent-notifications", labelKey: "admin.dashboard.links.seeNotifications", icon: Bell },
        { href: "/admin/send-notification", labelKey: "admin.dashboard.links.sendNotification", icon: Mail },
      ],
    },
    {
      titleKey: "admin.dashboard.documentsAndPromotions.title",
      icon: FileText,
      links: [
        { href: "/admin/ecmit", labelKey: "admin.dashboard.links.ecmit", icon: Award },
        { href: "/admin/evaluators", labelKey: "admin.dashboard.links.inviteEvaluators", icon: Users },
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

      <div className="mb-10">
        <AlgoliaSearchBar />
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title={t('admin.dashboard.stats.totalQuestions')}
          value={isLoadingStats ? "..." : (summaryStats?.totalQuestions || 0)}
          icon={Database}
          className="shadow-sm border-primary/10"
        />
        <StatCard
          title={t('admin.dashboard.stats.pendingReview')}
          value={isLoadingStats ? "..." : (summaryStats?.pendingQuestions || 0)}
          icon={FileCheck}
          className="shadow-sm border-orange-200 bg-orange-50/30 dark:bg-orange-950/10"
          description={t('admin.dashboard.stats.reviewedLabel', { count: (summaryStats?.reviewedQuestions || 0).toString() })}
        />
        <StatCard
          title={t('admin.dashboard.stats.pendingUsers')}
          value={isLoadingStats ? "..." : (summaryStats?.pendingUsers || 0)}
          icon={UserCheck}
          className="shadow-sm border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
        />
        <StatCard
          title={t('admin.dashboard.stats.activeIssues')}
          value={isLoadingStats ? "..." : (summaryStats?.activeReports || 0)}
          icon={AlertCircle}
          className="shadow-sm border-red-200 bg-red-50/30 dark:bg-red-950/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {adminSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <Card key={section.titleKey} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <SectionIcon className="h-6 w-6 text-primary" />
                  {t(section.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.links.map(link => {
                  const LinkIcon = link.icon;
                  return (
                    <Button asChild key={link.href} variant="outline" className="h-auto justify-start whitespace-normal text-left">
                      <Link href={link.href}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {t(link.labelKey)}
                      </Link>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
