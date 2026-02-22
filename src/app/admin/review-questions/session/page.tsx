"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck, ArrowLeft, FileCheck, CheckCircle2, SkipForward, FileEdit, Wand2, RefreshCw, Search, FileText, Lightbulb, RotateCcw, ExternalLink, Eraser } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { fetchQuestionStatsAndIdsForReview, markQuestionAsReviewed, resetReviewProgress } from '@/actions/user-data-actions';
import { getQuestionById, updateQuestion } from '@/actions/question-actions';
import { findScientificArticleAction, runQuestionQualityCheckAction } from '@/actions/enrichment-actions';
import { ArticleReferenceDisplay } from '@/components/article-reference-display';
import { stripCitationsFromText } from '@/lib/citations';
import type { Question, ScientificArticle } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function getCorrectAnswerIndex(q: Question): number {
  const options = q.translations?.en?.options;
  if (!options?.length) return 0;
  const idx = (q as any).correctAnswerIndex;
  if (typeof idx === 'number' && idx >= 0 && idx < options.length) return idx;
  const correctId = q.correctAnswerId;
  if (correctId) {
    const i = options.findIndex((o) => o.id === correctId);
    if (i >= 0) return i;
  }
  return 0;
}

function ReviewSessionContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const idFromUrl = searchParams.get('id');

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [queue, setQueue] = useState<string[]>([]);
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inlineQuestionText, setInlineQuestionText] = useState('');
  const [inlineOptions, setInlineOptions] = useState<{ id: string; text: string }[]>([]);
  const [inlineExplanation, setInlineExplanation] = useState('');
  const [inlineReference, setInlineReference] = useState('');
  const [qualityResult, setQualityResult] = useState<Awaited<ReturnType<typeof runQuestionQualityCheckAction>>['data'] | null>(null);
  const [isQualityChecking, setIsQualityChecking] = useState(false);
  const [isFindingArticle, setIsFindingArticle] = useState(false);
  const [aiLog, setAiLog] = useState<{ type: 'info' | 'success' | 'warning' | 'error'; text: string }[]>([]);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchList = useCallback(
    async (uid?: string, requestedId?: string | null) => {
      if (!uid) return;
      setIsListLoading(true);
      const options = category ? { category, subcategory: subcategory || undefined } : undefined;
      const result = await fetchQuestionStatsAndIdsForReview(uid, options);
      setIsListLoading(false);
      if (!result.success) {
        toast({ title: 'Error', description: result.error ?? 'Failed to load queue', variant: 'destructive' });
        return;
      }
      const ids = result.unreviewedIds ?? [];
      setReviewedCount(result.reviewedCount ?? 0);
      setTotalCount(result.totalCount ?? 0);
      let nextQueue = ids;
      let nextIndex = 0;
      if (requestedId) {
        const idx = ids.indexOf(requestedId);
        if (idx >= 0) {
          nextIndex = idx;
        } else {
          nextQueue = [requestedId, ...ids];
          nextIndex = 0;
        }
      }
      setQueue(nextQueue);
      setCurrentIndex(nextIndex);
      if (nextQueue.length === 0) {
        setCurrentQuestion(null);
      }
    },
    [category, subcategory, toast]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        setIsAdmin(userIsAdmin);
        setCurrentUser(user);
        await fetchList(user.uid, idFromUrl);
      } else {
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, idFromUrl, fetchList]);

  const currentId = queue[currentIndex] ?? null;

  useEffect(() => {
    if (!currentId || !currentUser) {
      setCurrentQuestion(null);
      setQualityResult(null);
      return;
    }
    setIsLoadingQuestion(true);
    setQualityResult(null);
    getQuestionById(currentId).then((res) => {
      setIsLoadingQuestion(false);
      if (res.success && res.question) {
        setCurrentQuestion(res.question);
        const q = res.question;
        setInlineQuestionText(q.translations?.en?.questionText ?? '');
        setInlineOptions(q.translations?.en?.options?.map((o) => ({ id: o.id, text: o.text })) ?? []);
        setInlineExplanation(q.translations?.en?.explanation ?? '');
        setInlineReference(q.scientificArticle?.article_reference ?? '');
        setIsEditing(false);
      } else {
        setCurrentQuestion(null);
      }
    });
  }, [currentId, currentUser]);

  const handleApprove = async () => {
    if (!currentId || !currentUser?.uid || !currentQuestion) return;
    setIsApproving(true);
    const result = await markQuestionAsReviewed(currentId, currentUser.uid, currentQuestion.scientificArticle);
    if (result.success) {
      setReviewedCount((c) => c + 1);
      if (currentIndex >= queue.length - 1) {
        await fetchList(currentUser.uid, searchParams.get('id'));
      } else {
        setCurrentIndex((i) => i + 1);
      }
      toast({ title: t('admin.reviewQuestions.approveAndNextButton'), variant: 'default' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsApproving(false);
  };

  const handleSkip = () => {
    if (currentIndex >= queue.length - 1) {
      fetchList(currentUser?.uid ?? undefined, searchParams.get('id'));
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleEditAndNext = () => {
    if (!currentQuestion?.id) return;
    window.open(`/admin/edit-question?id=${currentQuestion.id}`, '_blank', 'noopener,noreferrer');
    if (currentIndex >= queue.length - 1) {
      fetchList(currentUser?.uid ?? undefined, searchParams.get('id'));
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRemoveCitations = async () => {
    if (!currentId || !currentUser?.uid || !currentQuestion) return;
    const en = currentQuestion.translations?.en;
    const questionText = (isEditing ? inlineQuestionText : en?.questionText) ?? '';
    const explanation = (isEditing ? inlineExplanation : en?.explanation) ?? '';
    const options = (isEditing ? inlineOptions : en?.options?.map((o) => ({ id: o.id, text: o.text })) ?? []);
    const strippedQuestionText = stripCitationsFromText(questionText);
    const strippedExplanation = stripCitationsFromText(explanation);
    const strippedOptions = options.map((o) => ({ ...o, text: stripCitationsFromText(o.text) }));
    const translations: NonNullable<Question['translations']> = {
      en: { questionText: strippedQuestionText, options: strippedOptions, explanation: strippedExplanation },
    };
    if (currentQuestion.translations?.es) {
      const es = currentQuestion.translations.es;
      translations.es = {
        questionText: stripCitationsFromText(es.questionText ?? ''),
        explanation: stripCitationsFromText(es.explanation ?? ''),
        options: (es.options ?? []).map((o) => ({ ...o, text: stripCitationsFromText(o.text ?? '') })),
      };
    }
    if (currentQuestion.translations?.de) {
      const de = currentQuestion.translations.de;
      translations.de = {
        questionText: stripCitationsFromText(de.questionText ?? ''),
        explanation: stripCitationsFromText(de.explanation ?? ''),
        options: (de.options ?? []).map((o) => ({ ...o, text: stripCitationsFromText(o.text ?? '') })),
      };
    }
    setIsSavingEdit(true);
    const updateData: Partial<Question> = { translations };
    const result = await updateQuestion(currentId, updateData as Partial<Question>, currentUser.uid);
    if (result.success) {
      const markResult = await markQuestionAsReviewed(currentId, currentUser.uid, currentQuestion.scientificArticle ?? undefined);
      if (markResult.success) setReviewedCount((c) => c + 1);
      setCurrentQuestion((prev) => (prev ? { ...prev, translations } : null));
      setInlineQuestionText(strippedQuestionText);
      setInlineExplanation(strippedExplanation);
      setInlineOptions(strippedOptions);
      toast({ title: t('admin.reviewQuestions.removeCitationsDone'), variant: 'default' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSavingEdit(false);
  };

  const handleSaveInlineEdit = async () => {
    if (!currentId || !currentUser?.uid) return;
    setIsSavingEdit(true);
    const updateData: Partial<Question> = {
      translations: {
        en: {
          questionText: inlineQuestionText,
          options: inlineOptions,
          explanation: inlineExplanation,
        },
      },
      scientificArticle: { article_reference: inlineReference || null },
    };
    const result = await updateQuestion(currentId, updateData as Partial<Question>, currentUser.uid);
    if (result.success) {
      const markResult = await markQuestionAsReviewed(
        currentId,
        currentUser.uid,
        { article_reference: inlineReference || null }
      );
      if (markResult.success) setReviewedCount((c) => c + 1);
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              translations: {
                ...prev.translations,
                en: {
                  questionText: inlineQuestionText,
                  options: inlineOptions,
                  explanation: inlineExplanation,
                },
              },
              scientificArticle: { article_reference: inlineReference || null },
            }
          : null
      );
      setIsEditing(false);
      toast({ title: 'Saved', description: 'Question updated.', variant: 'default' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSavingEdit(false);
  };

  const handleAiSourceSearch = async () => {
    if (!currentQuestion || !currentUser?.uid) return;
    const correctIdx = getCorrectAnswerIndex(currentQuestion);
    const correctOpt = currentQuestion.translations?.en?.options?.[correctIdx];
    if (!correctOpt?.text) {
      toast({ title: t('admin.reviewQuestions.toast.aiSearchFailedTitle'), description: 'Mark a correct answer first.', variant: 'destructive' });
      return;
    }
    setIsFindingArticle(true);
    toast({ title: t('admin.reviewQuestions.toast.aiFindingSource'), variant: 'default' });
    setAiLog([{ type: 'info', text: 'Searching...' }]);
    const result = await findScientificArticleAction(
      {
        questionStem: currentQuestion.translations?.en?.questionText ?? '',
        options: (currentQuestion.translations?.en?.options ?? []).map((o) => o.text),
        correctAnswer: correctOpt.text,
      },
      currentUser.uid
    );
    if (result.success && result.data) {
      const data = result.data;
      const logs: { type: 'info' | 'success' | 'warning' | 'error'; text: string }[] = [];
      if (data.articleTitle && data.articleUrl) {
        const refText = `${data.articleTitle}. Available at: ${data.articleUrl}`;
        setInlineReference(refText);
        if (currentQuestion) {
          await updateQuestion(
            currentQuestion.id,
            { scientificArticle: { article_reference: refText } as ScientificArticle },
            currentUser.uid
          );
          setCurrentQuestion((prev) => (prev ? { ...prev, scientificArticle: { article_reference: refText } } : null));
        }
        logs.push({ type: 'success', text: `Source: ${data.articleTitle}` });
      } else {
        logs.push({ type: 'warning', text: data.search_returned_zero_results ? 'No articles found.' : 'No URL returned.' });
      }
      setAiLog(logs);
    } else {
      setAiLog([{ type: 'error', text: result.error ?? t('admin.reviewQuestions.toast.aiSearchFailedDescription') }]);
      toast({ title: t('admin.reviewQuestions.toast.aiSearchFailedTitle'), description: result.error, variant: 'destructive' });
    }
    setIsFindingArticle(false);
  };

  const handleQualityCheck = async () => {
    if (!currentQuestion || !currentUser?.uid) return;
    setIsQualityChecking(true);
    setQualityResult(null);
    const correctIdx = getCorrectAnswerIndex(currentQuestion);
    const options = currentQuestion.translations?.en?.options ?? [];
    const result = await runQuestionQualityCheckAction(
      {
        questionStem: currentQuestion.translations?.en?.questionText ?? '',
        options: options.map((o) => o.text),
        correctAnswerIndex: correctIdx,
        articleReference: currentQuestion.scientificArticle?.article_reference ?? null,
      },
      currentUser.uid
    );
    setIsQualityChecking(false);
    if (result.success && result.data) {
      setQualityResult(result.data);
    } else {
      toast({ title: 'Quality check failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleResetReviewProgress = async () => {
    if (!currentUser?.uid) return;
    setIsResetting(true);
    const result = await resetReviewProgress(currentUser.uid);
    setIsResetting(false);
    setIsResetDialogOpen(false);
    if (result.success) {
      toast({ title: 'Reset done', description: `Reset ${result.resetCount ?? 0} questions.` });
      await fetchList(currentUser.uid, searchParams.get('id'));
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const pendingCount = totalCount - reviewedCount;
  const showEmpty = !isListLoading && queue.length === 0 && !currentQuestion;
  const showQuestion = currentQuestion && !isLoadingQuestion;

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 rounded-xl border bg-card p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('admin.reviewQuestions.loadingShort')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertTitle>{t('admin.reviewQuestions.accessDenied')}</AlertTitle>
          <AlertDescription>{t('admin.reviewQuestions.adminRequired')}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/dashboard">{t('admin.reviewQuestions.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/review-questions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-primary" /> {t('admin.reviewQuestions.title')}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchList(currentUser?.uid, searchParams.get('id'))}
          disabled={isListLoading}
        >
          {isListLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {t('admin.reviewQuestions.refreshQueueButton')}
        </Button>
      </div>

      {/* Review Progress card */}
      <Card className="mb-6 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('admin.reviewQuestions.reviewProgressTitle')}</CardTitle>
          <CardDescription>
            {t('admin.reviewQuestions.counter', {
              reviewed: reviewedCount,
              total: totalCount,
              pending: pendingCount,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('admin.reviewQuestions.queueInSession', { count: queue.length })}
            {category && (
              <span className="ml-2">
                {t('admin.reviewQuestions.filterLabel', { category, subcategory: subcategory ? ` / ${subcategory}` : '' })}
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('admin.reviewQuestions.resetProgressButton')}
          </Button>
        </CardContent>
      </Card>

      {showEmpty && (
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              {t('admin.reviewQuestions.noMoreQuestionsTitle')}
            </CardTitle>
            <CardDescription>{t('admin.reviewQuestions.noMoreQuestionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchList(currentUser?.uid, searchParams.get('id'))} disabled={isListLoading}>
              {isListLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {t('admin.reviewQuestions.refreshButton')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoadingQuestion && currentId && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('admin.reviewQuestions.loading')}</p>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="space-y-6">
          {/* Verify Content card */}
          <Card className="border-primary/20">
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('admin.reviewQuestions.verifyContentTitle')}
                  </CardTitle>
                  <CardDescription className="font-mono">ID: {currentQuestion.id}</CardDescription>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('common.difficulty')}</span>
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary uppercase">
                    {t(`difficulty.${(currentQuestion.difficulty || 'easy').toLowerCase()}` as any)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleRemoveCitations} disabled={isSavingEdit}>
                  {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                  {t('admin.reviewQuestions.removeCitationsButton')}
                </Button>
              </div>
              {!isEditing ? (
                <>
                  <div>
                    <Label className="text-muted-foreground uppercase text-xs">{t('admin.reviewQuestions.questionLabel')}</Label>
                    <p className="mt-1 whitespace-pre-wrap">{currentQuestion.translations?.en?.questionText ?? '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground uppercase text-xs">{t('admin.reviewQuestions.optionsLabel')}</Label>
                    <ul className="mt-2 space-y-2 list-none">
                      {(currentQuestion.translations?.en?.options ?? []).map((opt, i) => (
                        <li key={opt.id ?? `option-${i}`} className="flex gap-2">
                          <span className="font-medium text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
                          <span>{opt.text}</span>
                          {i === getCorrectAnswerIndex(currentQuestion) && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-muted-foreground uppercase text-xs flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" /> {t('admin.reviewQuestions.explanationLabel')}
                    </Label>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {currentQuestion.translations?.en?.explanation?.trim() || t('admin.reviewQuestions.noExplanation')}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>{t('admin.reviewQuestions.questionTextLabel')}</Label>
                    <Textarea
                      value={inlineQuestionText}
                      onChange={(e) => setInlineQuestionText(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('admin.reviewQuestions.optionsLabel')}</Label>
                    <div className="mt-2 space-y-2">
                      {inlineOptions.map((opt, i) => (
                        <div key={opt.id ?? `inline-opt-${i}`} className="flex gap-2 items-center">
                          <span className="font-medium text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              const next = [...inlineOptions];
                              next[i] = { ...next[i], text: e.target.value };
                              setInlineOptions(next);
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>{t('admin.reviewQuestions.explanationLabel')}</Label>
                    <Textarea
                      value={inlineExplanation}
                      onChange={(e) => setInlineExplanation(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('admin.reviewQuestions.articleReferenceLabel')}</Label>
                    <Textarea
                      value={inlineReference}
                      onChange={(e) => setInlineReference(e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveInlineEdit} disabled={isSavingEdit}>
                      {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t('admin.reviewQuestions.saveAndStay')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t('admin.reviewQuestions.cancel')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reference card */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t('admin.reviewQuestions.referenceTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentQuestion.scientificArticle?.article_reference?.trim() ? (
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <ArticleReferenceDisplay
                      articleReference={currentQuestion.scientificArticle.article_reference}
                      doi={currentQuestion.scientificArticle?.doi}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    asChild
                    title="Search on Google"
                  >
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(currentQuestion.scientificArticle.article_reference)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('admin.reviewQuestions.noSourceFound')}</p>
              )}
              {!isEditing && (
                <Button variant="secondary" size="sm" onClick={handleAiSourceSearch} disabled={isFindingArticle}>
                  {isFindingArticle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {t('admin.reviewQuestions.findSourceWithAi')}
                </Button>
              )}
              {aiLog.length > 0 && (
                <div className="text-xs font-mono bg-muted/50 p-2 rounded space-y-1 max-h-24 overflow-y-auto">
                  {aiLog.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.type === 'success' ? 'text-green-600' : log.type === 'warning' ? 'text-amber-600' : log.type === 'error' ? 'text-destructive' : 'text-muted-foreground'
                      }
                    >
                      {log.text}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality card */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
<CardTitle className="text-base">{t('admin.reviewQuestions.qualityCheckTitle')}</CardTitle>
            <CardDescription>{t('admin.reviewQuestions.qualityCheckDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" onClick={handleQualityCheck} disabled={isQualityChecking}>
                {isQualityChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('admin.reviewQuestions.runQualityCheckButton')}
              </Button>
              {qualityResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded border">
                    <span className="font-medium">{t('admin.reviewQuestions.qualityQuestion')}: </span>
                    <span className={qualityResult.questionWellFormed === 'pass' ? 'text-green-600' : qualityResult.questionWellFormed === 'fail' ? 'text-destructive' : 'text-amber-600'}>
                      {qualityResult.questionWellFormed}
                    </span>
                    {qualityResult.questionMessage && <p className="mt-1 text-muted-foreground">{qualityResult.questionMessage}</p>}
                  </div>
                  <div className="p-2 rounded border">
                    <span className="font-medium">{t('admin.reviewQuestions.qualityOptions')}: </span>
                    <span className={qualityResult.optionsCoherent === 'pass' ? 'text-green-600' : qualityResult.optionsCoherent === 'fail' ? 'text-destructive' : 'text-amber-600'}>
                      {qualityResult.optionsCoherent}
                    </span>
                    {qualityResult.optionsMessage && <p className="mt-1 text-muted-foreground">{qualityResult.optionsMessage}</p>}
                  </div>
                  <div className="p-2 rounded border">
                    <span className="font-medium">{t('admin.reviewQuestions.qualityCorrectAnswer')}: </span>
                    <span className={qualityResult.correctAnswerValid === 'pass' ? 'text-green-600' : qualityResult.correctAnswerValid === 'fail' ? 'text-destructive' : 'text-amber-600'}>
                      {qualityResult.correctAnswerValid}
                    </span>
                    {qualityResult.correctAnswerMessage && <p className="mt-1 text-muted-foreground">{qualityResult.correctAnswerMessage}</p>}
                  </div>
                  <div className="p-2 rounded border">
                    <span className="font-medium">{t('admin.reviewQuestions.qualityReference')}: </span>
                    <span className={qualityResult.referencePlausible === 'pass' ? 'text-green-600' : qualityResult.referencePlausible === 'fail' ? 'text-destructive' : 'text-amber-600'}>
                      {qualityResult.referencePlausible}
                    </span>
                    {qualityResult.referenceMessage && <p className="mt-1 text-muted-foreground">{qualityResult.referenceMessage}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-primary/10">
            <CardContent className="pt-6 flex flex-wrap gap-3">
              <Button onClick={handleApprove} disabled={isApproving || isEditing}>
                {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {t('admin.reviewQuestions.approveAndNextButton')}
              </Button>
              <Button variant="secondary" onClick={handleSkip}>
                <SkipForward className="mr-2 h-4 w-4" />
                {t('admin.reviewQuestions.skipButton')}
              </Button>
              <Button variant="outline" onClick={handleEditAndNext} disabled={!currentQuestion?.id}>
                <FileEdit className="mr-2 h-4 w-4" />
                {t('admin.reviewQuestions.editAndNextButton')}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/edit-question?id=${currentQuestion.id}`} target="_blank" rel="noopener noreferrer">
                  {t('admin.reviewQuestions.openInEditPage')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Check for more at end of batch */}
          {currentIndex >= queue.length - 1 && queue.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchList(currentUser?.uid, searchParams.get('id'))} disabled={isListLoading}>
                {isListLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {t('admin.reviewQuestions.checkForMore')}
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.reviewQuestions.resetDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.reviewQuestions.resetDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.reviewQuestions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetReviewProgress} disabled={isResetting} className="bg-destructive text-destructive-foreground">
              {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('admin.reviewQuestions.resetAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ReviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <ReviewSessionContent />
    </Suspense>
  );
}
