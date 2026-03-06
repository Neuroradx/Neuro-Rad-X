"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { fetchLastReviewedQuestions, type LastReviewedQuestionItem } from '@/actions/user-data-actions';

export default function LastReviewedQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [questions, setQuestions] = useState<LastReviewedQuestionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [nextPageDocId, setNextPageDocId] = useState<string | undefined>();
  const [prevPageDocId, setPrevPageDocId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = (afterDocId?: string, beforeDocId?: string) => {
    if (!auth.currentUser?.uid) return;
    setIsLoading(true);
    setError(null);
    fetchLastReviewedQuestions(auth.currentUser.uid, { afterDocId, beforeDocId })
      .then((res) => {
        if (res.success && res.questions) {
          setQuestions(res.questions);
          setTotalCount(res.totalCount ?? 0);
          setHasNextPage(res.hasNextPage ?? false);
          setHasPrevPage(res.hasPrevPage ?? false);
          setNextPageDocId(res.nextPageDocId);
          setPrevPageDocId(res.prevPageDocId);
        } else {
          setError(res.error ?? 'Failed to load.');
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      loadPage();
    }
  }, []);

  const handleNext = () => {
    if (nextPageDocId) loadPage(nextPageDocId, undefined);
  };

  const handlePrev = () => {
    if (prevPageDocId) loadPage(undefined, prevPageDocId);
  };

  const openInWindow = (questionId: string) => {
    window.open(`/admin/edit-question?id=${questionId}`, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('admin.backToAdminDashboard')}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.lastReviewedQuestions.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.lastReviewedQuestions.description')}</p>
        </div>
      </div>

      <Card className="rounded-xl border-border/80 overflow-hidden shadow-lg">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <CardTitle>{t('admin.lastReviewedQuestions.title')}</CardTitle>
          <CardDescription>{t('admin.lastReviewedQuestions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16 rounded-xl border border-border/60 bg-muted/20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('admin.lastReviewedQuestions.noQuestions')}</p>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium w-[200px]">{t('admin.lastReviewedQuestions.id')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.lastReviewedQuestions.question')}</th>
                      <th className="text-right p-3 font-medium w-[120px]">{t('admin.lastReviewedQuestions.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => (
                      <tr key={q.id} className="border-t">
                        <td className="p-3 font-mono text-xs">{q.id}</td>
                        <td className="p-3 max-w-[500px] line-clamp-2">{q.questionText}</td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => openInWindow(q.id)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t('admin.lastReviewedQuestions.viewQuestion')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-sm text-muted-foreground">
                  {t('admin.lastReviewedQuestions.showingTotal', { total: totalCount.toString() })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrev} disabled={!hasPrevPage || isLoading}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('admin.lastReviewedQuestions.previous')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasNextPage || isLoading}>
                    {t('admin.lastReviewedQuestions.next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
