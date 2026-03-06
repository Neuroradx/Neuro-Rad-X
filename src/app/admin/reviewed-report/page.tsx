"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { fetchReviewerStats } from '@/actions/user-data-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ClipboardCheck, AlertCircle } from 'lucide-react';
import type { UserProfile } from '@/types';

type ReviewerStat = {
  id: string;
  displayName: string;
  email: string;
  subscriptionLevel: string;
  avatarUrl?: string;
  reviewedCount: number;
  editedCount: number;
};

export default function ReviewedReportPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewerStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (uid: string | null) => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchReviewerStats(uid);
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        throw new Error(result.error || "Failed to fetch reviewer stats.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserUid(user.uid);
      fetchStats(user.uid);
    }
  }, [fetchStats]);

  const getAvatarFallback = (name: string, email: string) => {
    if (name && name.trim()) {
      const nameParts = name.trim().split(/\s+/);
      const firstInitial = nameParts[0]?.[0] || '';
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
      const initials = (firstInitial + lastInitial).toUpperCase();
      if (initials) return initials;
    }
    if (email) return email[0].toUpperCase();
    return 'U';
  };


  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('admin.backToAdminDashboard')}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.reviewedReport.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.reviewedReport.description')}</p>
        </div>
      </div>

      <Card className="rounded-xl border-border/80 overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle>{t('admin.reviewedReport.tableTitle')}</CardTitle>
          <CardDescription>{t('admin.reviewedReport.tableDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16 rounded-xl border border-border/60 bg-muted/20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : stats.length === 0 ? (
            <Alert>
              <ClipboardCheck className="h-4 w-4" />
              <AlertTitle>{t('admin.reviewedReport.noReviewersTitle')}</AlertTitle>
              <AlertDescription>{t('admin.reviewedReport.noDataDescription')}</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t('admin.reviewedReport.table.name')}</TableHead>
                  <TableHead>{t('admin.reviewedReport.table.subscription')}</TableHead>
                  <TableHead className="text-right">{t('admin.reviewedReport.table.reviewed')}</TableHead>
                  <TableHead className="text-right">{t('admin.reviewedReport.table.edited')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((reviewer) => (
                  <TableRow key={reviewer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={reviewer.avatarUrl} alt={reviewer.displayName} />
                          <AvatarFallback>{getAvatarFallback(reviewer.displayName, reviewer.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reviewer.displayName}</p>
                          <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {/* ----- LÍNEA CORREGIDA ----- */}
                        {t(
                          `settingsPage.plans.${(reviewer.subscriptionLevel || 'free').toLowerCase()}`,
                          { defaultValue: reviewer.subscriptionLevel || 'free' }
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{reviewer.reviewedCount}</TableCell>
                    <TableCell className="text-right font-mono">{reviewer.editedCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
