"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Loader2, FileWarning, AlertCircle, ShieldAlert, CheckCircle, RefreshCw, Eye, Archive, ChevronLeft, ChevronRight, FileEdit, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import type { IssueReport as IssueReportType, UserProfile } from '@/types';
import { fetchSimpleUserDetails, fetchReportedIssues, updateIssueStatus } from '@/actions/user-data-actions';
import { format } from 'date-fns';
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formatTimestamp = (timestamp: string | undefined): string => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

const ISSUES_PER_PAGE = 10;

export default function ReportedQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [reportedIssues, setReportedIssues] = useState<IssueReportType[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedReport, setSelectedReport] = useState<IssueReportType | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [reporterProfile, setReporterProfile] = useState<UserProfile | null>(null);
  const [isFetchingReporter, setIsFetchingReporter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(totalCount / ISSUES_PER_PAGE), [totalCount]);

  const [isResolveConfirmOpen, setIsResolveConfirmOpen] = useState(false);
  const [reportToResolve, setReportToResolve] = useState<IssueReportType | null>(null);


  useEffect(() => {
    if (isDetailsDialogOpen && selectedReport && currentUser) {
      if (selectedReport.userId === "anonymous") {
        setReporterProfile({
          id: 'anonymous',
          displayName: t('admin.reportedQuestionsPage.anonymousReporter'),
          email: selectedReport.userProvidedEmail || t('common.notAvailable'),
          role: 'user',
        } as UserProfile);
        return;
      }

      const fetchReporterDetails = async () => {
        setIsFetchingReporter(true);
        setReporterProfile(null);
        const result = await fetchSimpleUserDetails(selectedReport.userId, currentUser.uid);
        if (result.success && result.user) {
          setReporterProfile(result.user);
        } else {
          console.error("Failed to fetch reporter details:", result.error);
          setReporterProfile({
            id: selectedReport.userId,
            displayName: selectedReport.reporterDisplayName || t('admin.reportedQuestionsPage.userNotFound'),
            email: selectedReport.userEmailFromAuth || t('common.notAvailable'),
            role: 'user',
          } as UserProfile);
        }
        setIsFetchingReporter(false);
      };
      fetchReporterDetails();
    }
  }, [isDetailsDialogOpen, selectedReport, t, currentUser]);

  const fetchData = useCallback(async (page: number, callerUid: string) => {
    setIsLoadingIssues(true);
    setFetchError(null);
    try {
      const result = await fetchReportedIssues(page, ISSUES_PER_PAGE, callerUid);
      if (result.success && result.reports) {
        setReportedIssues(result.reports as IssueReportType[]);
        setTotalCount(result.totalCount || 0);
      } else {
        throw new Error(result.error || t('admin.reportedQuestionsPage.errorFetchingList'));
      }
    } catch (error: any) {
      console.error("Error fetching reported issues:", error);
      setFetchError(error.message);
    } finally {
      setIsLoadingIssues(false);
    }
  }, [t]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      fetchData(currentPage, user.uid);
    }
  }, [currentPage, fetchData]);

  const openDetailsDialog = (report: IssueReportType) => {
    setSelectedReport(report);
    setIsDetailsDialogOpen(true);
  };

  const updateStatusAndNotify = async (report: IssueReportType, newStatus: IssueReportType['status'], sendNotification: boolean) => {
    if (!currentUser) return;

    const result = await updateIssueStatus(report.id, newStatus, sendNotification, {
      userId: report.userId,
      questionId: report.questionId,
    }, currentUser.uid);

    if (result.success) {
      toast({ title: t('admin.reportedQuestionsPage.statusUpdateSuccessTitle'), description: t('admin.reportedQuestionsPage.statusUpdateSuccessDesc', { status: t(`admin.reportedQuestionsPage.statusValues.${newStatus}`) }), variant: 'success' });
      fetchData(currentPage, currentUser.uid); // Refresh data from server

      if (selectedReport && selectedReport.id === report.id) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      console.error("Error updating report status:", result.error);
      toast({ title: t('toast.errorTitle'), description: result.error || t('admin.reportedQuestionsPage.statusUpdateErrorDesc'), variant: 'destructive' });
    }
  }

  const handleStatusUpdate = (report: IssueReportType, newStatus: IssueReportType['status']) => {
    if (newStatus === 'resolved') {
      setReportToResolve(report);
      setIsResolveConfirmOpen(true);
    } else {
      const sendNotification = newStatus === 'wont-fix';
      updateStatusAndNotify(report, newStatus, sendNotification);
    }
  };

  const handleConfirmResolve = (sendNotification: boolean) => {
    if (!reportToResolve) return;
    updateStatusAndNotify(reportToResolve, 'resolved', sendNotification);
    setIsResolveConfirmOpen(false);
    setReportToResolve(null);
  };


  return (
    <>
      <div className="container mx-auto py-8 max-w-6xl">
        <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
        </Button>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileWarning className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav.reportedQuestions')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{t('admin.reportedQuestionsPage.description')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg shrink-0" onClick={() => currentUser && fetchData(currentPage, currentUser.uid)} disabled={isLoadingIssues}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingIssues ? 'animate-spin' : ''}`} />
            {t('admin.reportedQuestionsPage.refreshButton')}
          </Button>
        </div>

        {isLoadingIssues && (
          <div className="flex flex-col justify-center items-center py-16 rounded-xl border border-border/60 bg-muted/20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{t('admin.reportedQuestionsPage.loadingIssues')}</p>
          </div>
        )}

        {!isLoadingIssues && fetchError && (
          <ErrorAlert description={fetchError} className="rounded-xl" />
        )}

        {!isLoadingIssues && !fetchError && reportedIssues.length === 0 && (
          <Alert className="rounded-xl border-border/60">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>{t('admin.reportedQuestionsPage.noIssuesTitle')}</AlertTitle>
            <AlertDescription>{t('admin.reportedQuestionsPage.noIssuesDesc')}</AlertDescription>
          </Alert>
        )}

        {!isLoadingIssues && !fetchError && reportedIssues.length > 0 && (
          <Accordion type="multiple" className="w-full space-y-6">
            {reportedIssues.map((issue) => (
              <Card key={issue.id} className="shadow-lg rounded-xl border-border/80 overflow-hidden">
                <AccordionItem value={issue.id} className="border-b-0">
                  <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg w-full">
                    <div className="flex justify-between items-center w-full gap-4">
                      <div className="text-left flex-1">
                        <p className="text-lg font-semibold text-primary break-words">
                          {t(issue.problemType)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {issue.questionId}
                        </p>
                      </div>
                      <Badge
                        variant={issue.status === 'new' ? 'destructive' : issue.status === 'resolved' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs shrink-0",
                          issue.status === 'new' && "bg-red-500/80 text-white",
                          issue.status === 'acknowledged' && "bg-yellow-500/80 text-black",
                          issue.status === 'in-progress' && "bg-blue-500/80 text-white",
                          issue.status === 'resolved' && "bg-green-500/80 text-white",
                          issue.status === 'wont-fix' && "bg-gray-500/80 text-white",
                        )}
                      >
                        {t(`admin.reportedQuestionsPage.statusValues.${issue.status}`)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="p-4 border-t">
                      {issue.reporterProfile ? (
                        <UserInfoCard user={issue.reporterProfile} />
                      ) : (
                        <Card className="shadow-none border-dashed"><CardHeader><p className="text-sm text-muted-foreground">{t('admin.reportedQuestionsPage.anonymousReporter')}: {issue.userProvidedEmail || t('common.notAvailable')}</p></CardHeader></Card>
                      )}
                    </div>
                    <div className="px-4 pb-4 border-t pt-4">
                      <p className="text-sm text-muted-foreground break-words">
                        <span className="font-medium text-foreground">{t('admin.reportedQuestionsPage.card.descriptionSnippet')}: </span>
                        {issue.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-4 border-t bg-muted/30 rounded-b-lg">
                      <span className="text-xs text-muted-foreground">{formatTimestamp(issue.timestamp as string)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetailsDialog(issue)} aria-label={t('admin.reportedQuestionsPage.viewDetailsAriaLabel', { id: issue.questionId })}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('admin.reportedQuestionsPage.viewDetailsButton')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(issue, 'archived')} aria-label={t('admin.reportedQuestionsPage.archiveButtonAriaLabel', { id: issue.questionId })}>
                          <Archive className="mr-2 h-4 w-4" />
                          {t('admin.reportedQuestionsPage.archiveButton')}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        )}

        {!isLoadingIssues && !fetchError && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              {t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {selectedReport && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t('admin.reportedQuestionsPage.detailsDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('admin.reportedQuestionsPage.detailsDialog.questionIdLabel')}: <Link href={`/questions/${selectedReport.questionId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-sm">{selectedReport.questionId}</Link>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {isFetchingReporter ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reporterProfile ? (
                <UserInfoCard user={reporterProfile} />
              ) : (
                <p>{t('admin.reportedQuestionsPage.noReporterInfo')}</p>
              )}
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-md">{t('admin.reportedQuestionsPage.detailsDialog.questionStemLabel')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground pt-0 pb-4 max-h-32 overflow-y-auto">
                  {selectedReport.questionStem}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-md">{t('admin.reportedQuestionsPage.detailsDialog.problemTypeLabel')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground pt-0 pb-4">
                  {t(selectedReport.problemType)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-md">{t('admin.reportedQuestionsPage.detailsDialog.descriptionLabel')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground pt-0 pb-4 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedReport.description}
                </CardContent>
              </Card>

              <div className="mt-4 space-y-2">
                <Label htmlFor="report-status" className="font-semibold">{t('admin.reportedQuestionsPage.detailsDialog.updateStatusLabel')}:</Label>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'acknowledged', 'in-progress', 'resolved', 'wont-fix', 'archived'] as const).map(statusValue => (
                    <Button
                      key={statusValue}
                      variant={selectedReport.status === statusValue ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedReport, statusValue)}
                      className={cn(
                        selectedReport.status === statusValue && statusValue === 'new' && "bg-red-600 hover:bg-red-700 text-white",
                        selectedReport.status === statusValue && statusValue === 'acknowledged' && "bg-yellow-500 hover:bg-yellow-600 text-black",
                        selectedReport.status === statusValue && statusValue === 'in-progress' && "bg-blue-500 hover:bg-blue-600 text-white",
                        selectedReport.status === statusValue && statusValue === 'resolved' && "bg-green-500 hover:bg-green-600 text-white",
                        selectedReport.status === statusValue && statusValue === 'wont-fix' && "bg-gray-500 hover:bg-gray-600 text-white",
                        selectedReport.status === statusValue && statusValue === 'archived' && "bg-slate-500 hover:bg-slate-600 text-white"
                      )}
                    >
                      {t(`admin.reportedQuestionsPage.statusValues.${statusValue}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 sm:justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  asChild
                >
                  <Link href={`/admin/edit-question?id=${selectedReport.questionId}`} target="_blank" rel="noopener noreferrer">
                    <FileEdit className="mr-2 h-4 w-4" />
                    {t('admin.reportedQuestionsPage.detailsDialog.editQuestionButton')}
                  </Link>
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedReport.userId && selectedReport.userId !== "anonymous" && currentUser) {
                      router.push(`/admin/send-notification?userId=${selectedReport.userId}`);
                      setIsDetailsDialogOpen(false);
                    }
                  }}
                  disabled={!selectedReport.userId || selectedReport.userId === "anonymous"}
                  aria-label={t('admin.reportedQuestionsPage.detailsDialog.notifyReporterButtonAria', { reporterName: selectedReport.reporterDisplayName || 'reporter' })}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t('admin.reportedQuestionsPage.detailsDialog.notifyReporterButton')}
                </Button>
              </div>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('common.close')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isResolveConfirmOpen} onOpenChange={setIsResolveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitleComponent>{t('admin.reportedQuestionsPage.resolveDialog.title')}</AlertDialogTitleComponent>
            <AlertDialogDescription>
              {t('admin.reportedQuestionsPage.resolveDialog.description', { questionId: reportToResolve?.questionId || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsResolveConfirmOpen(false)}>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="outline" onClick={() => handleConfirmResolve(false)}>
              {t('admin.reportedQuestionsPage.resolveDialog.confirmButtonNo')}
            </Button>
            <Button onClick={() => handleConfirmResolve(true)}>
              {t('admin.reportedQuestionsPage.resolveDialog.confirmButtonYes')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}