"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { fetchLastReviewedQuestions, type LastReviewedQuestionItem } from '@/actions/user-data-actions';

export default function LastReviewedQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
          setIsAdmin(userIsAdmin);
          if (userIsAdmin) loadPage();
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleNext = () => {
    if (nextPageDocId) loadPage(nextPageDocId, undefined);
  };

  const handlePrev = () => {
    if (prevPageDocId) loadPage(undefined, prevPageDocId);
  };

  const openInWindow = (questionId: string) => {
    window.open(`/admin/edit-question?id=${questionId}`, '_blank', 'noopener,noreferrer');
  };

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>{t('admin.accessDenied.title')}</AlertTitle>
          <AlertDescription>{t('admin.accessDenied.description')}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          {t('admin.accessDenied.backToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" asChild>
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.backToAdminDashboard')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            {t('admin.lastReviewedQuestions.title')}
          </CardTitle>
          <CardDescription>{t('admin.lastReviewedQuestions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
                  {t('admin.lastReviewedQuestions.showingTotal', { total: totalCount })}
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
