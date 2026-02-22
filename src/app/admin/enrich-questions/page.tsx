'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { getQuestionEnrichmentStats, enrichQuestionsWithSources } from '@/actions/enrichment-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Wand2, AlertCircle, CheckCircle, Play, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const BATCH_SIZE = 30; // How many questions to process in one go with the AI

export default function EnrichQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; enriched: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRunResult, setLastRunResult] = useState<{ processed: number; updated: number } | null>(null);
  const [sessionUpdatedCount, setSessionUpdatedCount] = useState(0);

  const isRunningRef = useRef(false);
  const lastScannedDocIdRef = useRef<string | null>(null);

  const fetchStats = useCallback(async (uid: string | null): Promise<{ enriched: number; total: number } | null> => {
    if (!uid) return null;
    setError(null);
    try {
      const result = await getQuestionEnrichmentStats(uid);
      if (result.success && result.total !== undefined && result.enriched !== undefined) {
        setStats({ total: result.total, enriched: result.enriched });
        return { enriched: result.enriched, total: result.total };
      } else {
        throw new Error(result.error || "Failed to fetch stats.");
      }
    } catch (err: any) {
      setError(err.message);
    }
    return null;
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        if (isAdmin) setCurrentUserUid(user.uid);
        else setCurrentUserUid(null);
        if (!isAdmin) router.push('/admin/dashboard');
      } else {
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!currentUserUid) return;
    setIsLoadingStats(true);
    fetchStats(currentUserUid).finally(() => setIsLoadingStats(false));
  }, [fetchStats, currentUserUid]);

  const handleStartStopAutoEnrichment = async () => {
    if (isRunningRef.current) {
      isRunningRef.current = false;
      setIsEnriching(false);
      return;
    }
    if (!currentUserUid) {
      setError('Authentication required.');
      return;
    }

    setIsEnriching(true);
    setError(null);
    setLastRunResult(null);
    setSessionUpdatedCount(0);
    lastScannedDocIdRef.current = null;
    isRunningRef.current = true;

    // We start the loop and let it manage itself.
    // The initial stats are fetched inside the loop for the first time.
    while (isRunningRef.current) {
      try {
        const result = await enrichQuestionsWithSources(BATCH_SIZE, lastScannedDocIdRef.current, currentUserUid!);
        
        if (result.success) {
          lastScannedDocIdRef.current = result.nextCursor;
          setLastRunResult({ processed: result.processed, updated: result.updated });
          setSessionUpdatedCount(prev => prev + (result.updated || 0));
        } else {
          throw new Error(result.error || "A batch failed during auto-enrichment.");
        }
        
        // After a successful batch, refresh the overall stats for the UI
        await fetchStats(currentUserUid);
        
        // If there's no next cursor, the collection has been fully scanned.
        if (!lastScannedDocIdRef.current) {
          console.log("Enrichment process reached the end of the collection.");
          break;
        }

        // A small delay between batches to be nice to the APIs and backend
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err: any) {
        setError(err.message);
        break; // Exit loop on error
      }
    }

    // Clean up after the loop finishes or breaks
    isRunningRef.current = false;
    setIsEnriching(false);
    await fetchStats(currentUserUid); // Final stats refresh
  };
  
  const enrichmentPercentage = stats ? (stats.total > 0 ? (stats.enriched / stats.total) * 100 : 100) : 0;
  const isComplete = stats ? stats.enriched >= stats.total : false;

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.push('/admin/dashboard')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('admin.backToAdminDashboard')}
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <Wand2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('admin.enrichQuestions.title')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t('admin.enrichQuestions.description')}</p>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>{t('admin.enrichQuestions.statsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStats ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : stats && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{t('admin.enrichQuestions.enrichedLabel')}</span>
                <span>{stats.enriched} / {stats.total}</span>
              </div>
              <Progress value={enrichmentPercentage} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('admin.enrichQuestions.unrichedLabel')}: {stats.total - stats.enriched}</span>
                <span>{enrichmentPercentage.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
          {isComplete && !isLoadingStats && (
            <Alert variant="default" className="w-full bg-green-500/10 border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700 font-bold">{t('admin.enrichQuestions.noMoreToEnrich')}</AlertTitle>
            </Alert>
          )}

          {!isComplete && (
            <Button
              onClick={handleStartStopAutoEnrichment}
              disabled={isLoadingStats || isComplete}
              size="lg"
              className="w-full"
              variant={isEnriching ? "destructive" : "default"}
            >
              {isEnriching ? (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  {t('admin.enrichQuestions.stopAutoButton')}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {t('admin.enrichQuestions.startAutoButton')}
                </>
              )}
            </Button>
          )}

          {isEnriching && (
            <div className="text-sm text-muted-foreground animate-pulse">
                {t('admin.enrichQuestions.autoRunningStatus')}
            </div>
          )}

          {sessionUpdatedCount > 0 && (
             <Alert className="w-full">
                <Wand2 className="h-4 w-4" />
                <AlertTitle>{t('admin.enrichQuestions.sessionUpdatedLabel')}</AlertTitle>
                <AlertDescription>
                    {t('admin.enrichQuestions.sessionUpdatedCount', { count: sessionUpdatedCount.toString() })}
                </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
