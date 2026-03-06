'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
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
    const user = auth.currentUser;
    if (user) {
      setCurrentUserUid(user.uid);
    }
  }, []);

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
          lastScannedDocIdRef.current = result.nextCursor ?? null;
          setLastRunResult({ processed: result.processed || 0, updated: result.updated || 0 });
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


  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('admin.backToAdminDashboard')}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wand2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.enrichQuestions.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.enrichQuestions.description')}</p>
        </div>
      </div>

      <Card className="max-w-xl mx-auto rounded-xl border-border/80 overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle>{t('admin.enrichQuestions.statsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStats ? (
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
