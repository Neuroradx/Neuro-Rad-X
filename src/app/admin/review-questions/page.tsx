"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, ShieldCheck, FileEdit, Wand2, ArrowLeft, RefreshCw, CheckCircle2, X, Save, ExternalLink, Sparkles, FileText, Lightbulb, Tag } from 'lucide-react';
import { fetchQuestionStatsAndIdsForReview, markQuestionAsReviewed } from '@/actions/user-data-actions';
import { getQuestionById, updateQuestion } from '@/actions/question-actions';
import { findScientificArticleAction } from '@/actions/enrichment-actions';
import type { Question, ScientificArticle } from '@/types';

export default function ReviewQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [unreviewedIds, setUnreviewedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ reviewed: 0, total: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isFindingArticle, setIsFindingArticle] = useState(false);
  
  // Inline Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [aiSuggestedArticle, setAiSuggestedArticle] = useState<ScientificArticle | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoadingList(true);
    const result = await fetchQuestionStatsAndIdsForReview();
    if (result.success) {
      setUnreviewedIds(result.unreviewedIds || []);
      setStats({ reviewed: result.reviewedCount || 0, total: result.totalCount || 0 });
      setCurrentIndex(0);
    }
    setIsLoadingList(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        setIsAdmin(userIsAdmin);
        setCurrentUser(user);
        if (userIsAdmin) fetchList();
      } else {
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, fetchList]);

  useEffect(() => {
    const loadCurrentQuestion = async () => {
      if (unreviewedIds.length > 0 && currentIndex < unreviewedIds.length) {
        setIsLoadingQuestion(true);
        setIsEditMode(false);
        setAiSuggestedArticle(null);
        const result = await getQuestionById(unreviewedIds[currentIndex]);
        if (result.success && result.question) {
          setCurrentQuestion(result.question);
          // Initialize edit form
          setEditFormData({
            questionText: result.question.translations.en.questionText,
            explanation: result.question.translations.en.explanation,
            correctAnswerIndex: result.question.correctAnswerIndex ?? 0,
            options: result.question.translations.en.options.map(o => ({ ...o })),
            scientificArticle: result.question.scientificArticle || { article_reference: '' }
          });
        }
        setIsLoadingQuestion(false);
      } else if (unreviewedIds.length > 0 && currentIndex >= unreviewedIds.length) {
        // Refresh list if we reach the end of the batch
        fetchList();
      }
    };
    loadCurrentQuestion();
  }, [currentIndex, unreviewedIds, fetchList]);

  const handleApprove = async () => {
    if (!currentQuestion || !currentUser) return;
    setIsActionLoading(true);
    const result = await markQuestionAsReviewed(currentQuestion.id, currentUser.uid, aiSuggestedArticle || undefined);
    if (result.success) {
      toast({ title: "Approved", description: "Question validated successfully.", variant: "success" });
      setCurrentIndex(prev => prev + 1);
      setStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
    } else {
      toast({ title: "Error", variant: "destructive", description: result.error });
    }
    setIsActionLoading(false);
  };

  const handleSaveInlineEdit = async () => {
    if (!currentQuestion || !editFormData) return;
    setIsActionLoading(true);
    
    const updateData = {
      translations: {
        en: {
          questionText: editFormData.questionText,
          explanation: editFormData.explanation,
          options: editFormData.options
        }
      },
      correctAnswerIndex: editFormData.correctAnswerIndex,
      scientificArticle: editFormData.scientificArticle
    };

    const result = await updateQuestion(currentQuestion.id, updateData as any);
    if (result.success) {
      toast({ title: "Saved", description: "Changes applied.", variant: "success" });
      setCurrentQuestion(prev => prev ? ({
        ...prev,
        ...updateData,
        translations: { ...prev.translations, en: updateData.translations.en }
      } as any) : null);
      setIsEditMode(false);
    } else {
      toast({ title: "Error", variant: "destructive", description: result.error });
    }
    setIsActionLoading(false);
  };

  const handleAiSourceSearch = async () => {
    if (!editFormData) return;
    setIsFindingArticle(true);
    const result = await findScientificArticleAction({
      questionStem: editFormData.questionText,
      options: editFormData.options.map((o: any) => o.text),
      correctAnswer: editFormData.options[editFormData.correctAnswerIndex]?.text || ""
    });

    if (result.success && result.data?.isValid) {
      const ref = `${result.data.articleTitle}. Available at: ${result.data.articleUrl}`;
      setAiSuggestedArticle({ article_reference: ref });
      setEditFormData({
        ...editFormData,
        scientificArticle: { article_reference: ref }
      });
      toast({ title: "Source Found", description: "AI found a relevant article." });
    } else {
      toast({ title: "No Source Found", description: "AI couldn't find a matching article.", variant: "destructive" });
    }
    setIsFindingArticle(false);
  };

  if (isAuthLoading || isLoadingList) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p>Loading review queue...</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive"><AlertTitle>Access Denied</AlertTitle><AlertDescription>Admin privileges required.</AlertDescription></Alert>
        <Button asChild className="mt-4"><Link href="/dashboard">Back to Home</Link></Button>
      </div>
    );
  }

  const reviewProgress = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="text-primary" /> Question Review</h1>
        </div>
        <Button variant="outline" onClick={fetchList}><RefreshCw className="mr-2 h-4 w-4" /> Refresh Queue</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Review Progress</CardTitle>
            <CardDescription>{stats.reviewed} of {stats.total} questions verified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={reviewProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">{unreviewedIds.length} questions remaining in this batch.</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {isLoadingQuestion ? (
            <Card className="p-12 flex justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></Card>
          ) : currentQuestion ? (
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-muted/30">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Verify Content</CardTitle>
                    <CardDescription className="font-mono text-xs">ID: {currentQuestion.id}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary">{currentQuestion.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {currentQuestion.topic || (currentQuestion as any).main_localization || 'N/A'}
                  </Badge>
                  {(currentQuestion.subtopic || (currentQuestion as any).sub_main_location) && (
                    <Badge variant="outline">
                      {currentQuestion.subtopic || (currentQuestion as any).sub_main_location}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>Question Stem</Label>
                  {isEditMode ? (
                    <Textarea 
                      value={editFormData.questionText} 
                      onChange={(e) => setEditFormData({...editFormData, questionText: e.target.value})} 
                      rows={4}
                    />
                  ) : (
                    <p className="text-lg leading-relaxed">{currentQuestion.translations.en.questionText}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  <div className="grid gap-3">
                    {isEditMode ? (
                      editFormData.options.map((opt: any, idx: number) => (
                        <div key={`edit-opt-${idx}`} className="flex gap-2 items-center">
                          <Input value={opt.text} onChange={(e) => {
                            const newOpts = [...editFormData.options];
                            newOpts[idx].text = e.target.value;
                            setEditFormData({...editFormData, options: newOpts});
                          }} className="flex-1" />
                          <Button 
                            variant={editFormData.correctAnswerIndex === idx ? "default" : "outline"} 
                            size="sm"
                            className={editFormData.correctAnswerIndex === idx ? "bg-primary text-primary-foreground min-w-[80px]" : "min-w-[80px]"}
                            onClick={() => setEditFormData({...editFormData, correctAnswerIndex: idx})}
                          >
                            {editFormData.correctAnswerIndex === idx ? "Correct" : "Mark"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      currentQuestion.translations.en.options.map((opt, idx) => (
                        <div key={`view-opt-${idx}`} className="flex justify-between items-center p-3 border rounded-md bg-background/50">
                          <span>{opt.text}</span>
                          {currentQuestion.correctAnswerIndex === idx && (
                            <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" /> Correct Answer</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" /> 
                    Explanation
                  </Label>
                  {isEditMode ? (
                    <Textarea 
                      value={editFormData.explanation} 
                      onChange={(e) => setEditFormData({...editFormData, explanation: e.target.value})} 
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border italic">
                      {currentQuestion.translations.en.explanation || "No explanation provided."}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/20 p-6">
                {isEditMode ? (
                  <div className="flex gap-2 w-full justify-end">
                    <Button variant="outline" onClick={() => setIsEditMode(false)}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                    <Button onClick={handleSaveInlineEdit} disabled={isActionLoading} className="bg-primary text-primary-foreground">
                      {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditMode(true)}><FileEdit className="mr-2 h-4 w-4" /> Edit Inline</Button>
                      <Button variant="outline" asChild><Link href={`/admin/edit-question?id=${currentQuestion.id}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Open Editor</Link></Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setCurrentIndex(prev => prev + 1)}>Skip</Button>
                      <Button onClick={handleApprove} disabled={isActionLoading} className="bg-green-600 hover:bg-green-700 text-white">
                        {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto opacity-20" />
              <CardTitle>Queue Empty</CardTitle>
              <CardDescription>No more questions waiting for review in this batch.</CardDescription>
              <Button onClick={fetchList}>Check for more</Button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Current Source</CardTitle></CardHeader>
            <CardContent>
              {currentQuestion?.scientificArticle?.article_reference ? (
                <p className="text-sm border p-3 rounded bg-muted/30 whitespace-pre-wrap">{currentQuestion.scientificArticle.article_reference}</p>
              ) : (
                <div className="text-center py-4 border-2 border-dashed rounded">
                  <p className="text-xs text-muted-foreground mb-4">No scientific source attached.</p>
                  <Button size="sm" variant="secondary" onClick={handleAiSourceSearch} disabled={isFindingArticle || isEditMode}>
                    {isFindingArticle ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />} Find with AI
                  </Button>
                </div>
              )}
              {aiSuggestedArticle && (
                <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-primary uppercase mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Suggestion</p>
                  <p className="text-xs">{aiSuggestedArticle.article_reference}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
