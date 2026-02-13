
'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bookmark, ChevronRight, ThumbsUp, ThumbsDown, FileEdit, AlertCircle, Loader2, ShieldCheck, Search, FileText } from "lucide-react";
import { ImageDisplay } from '@/components/questions/image-display';
import { useTranslation } from '@/hooks/use-translation';
import type { User as FirebaseUser } from "firebase/auth";
import type { Firestore } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const ReportIssueDialog = dynamic(() => import('@/components/questions/report-issue-dialog').then(mod => mod.ReportIssueDialog), {
  suspense: true,
});


interface FlashcardDisplayProps {
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  showFlashcardAnswer: boolean;
  flashcardFeedback: 'good' | 'bad' | null;
  isBookmarked: boolean;
  mode: 'tutor' | 'exam' | 'flashcards';
  userRole: string | null;
  setShowFlashcardAnswer: (show: boolean) => void;
  setFlashcardFeedback: (feedback: 'good' | 'bad' | null) => void;
  handleNextQuestion: () => Promise<void>;
  handlePreviousQuestion: () => void;
  handleBookmarkToggle: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
  db: Firestore | null;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  showFlashcardAnswer,
  flashcardFeedback,
  isBookmarked,
  mode,
  userRole,
  setShowFlashcardAnswer,
  setFlashcardFeedback,
  handleNextQuestion,
  handlePreviousQuestion,
  handleBookmarkToggle,
  firebaseUser,
  db
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  if (!currentQuestion) return null;

  const difficultyText = t(`difficulty.${currentQuestion.difficulty.toLowerCase()}` as any);
  
  // Use pre-translated topic and subtopic directly from currentQuestion
  const displayTopic = currentQuestion.topic;
  const displaySubtopic = currentQuestion.subtopic || '';


  return (
    <>
    <Card className="shadow-xl overflow-hidden w-full max-w-2xl mx-auto" key={currentQuestion.id || currentQuestionIndex}>
      <CardHeader>
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="text-2xl">{t('studyModes.flashcards.name')}</CardTitle>
          <div className="text-right">
            <p className="text-sm font-semibold capitalize text-primary">{t('common.difficultyLabelWithColon', { difficulty: difficultyText })}</p>
          </div>
        </div>
        {(displayTopic || displaySubtopic) && (
          <CardDescription className="text-md text-muted-foreground">
            {displayTopic}{displaySubtopic ? `: ${displaySubtopic}` : ''}
          </CardDescription>
        )}
        <p className="text-sm text-muted-foreground pt-1">{t('studyMode.questionProgress', { current: (currentQuestionIndex + 1).toString(), total: totalQuestions.toString() })}</p>
        <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="w-full mt-1 h-2" />
      </CardHeader>
      <CardContent className="space-y-6 relative pb-12 min-h-[300px] flex flex-col items-center justify-center text-center">
        {currentQuestion.imageUrl && !showFlashcardAnswer && (
          <ImageDisplay src={currentQuestion.imageUrl} alt={t('common.imageFor', { topic: displayTopic })} dataAiHint={`${currentQuestion.localization || displayTopic} diagnostic`} initialWidth={400} initialHeight={300}/>
        )}
        <p className={`text-xl leading-relaxed ${showFlashcardAnswer ? 'mb-4' : 'font-semibold'}`}>
          {showFlashcardAnswer ? currentQuestion.explanation : currentQuestion.stem}
        </p>
        {showFlashcardAnswer && currentQuestion.options && currentQuestion.options.length > 0 && currentQuestion.type === 'mcq' && (
          <div className="text-left w-full mt-4 p-4 bg-muted/50 rounded-md">
            <p className="font-semibold mb-2">{t('studyMode.correctAnswerOption')}:</p>
            <ul className="list-disc pl-5 space-y-1">
              {currentQuestion.options.filter(opt => opt.id === currentQuestion.correctAnswerId).map(opt => (
                <li key={opt.id} className='text-green-600 font-medium'>{opt.text}</li>
              ))}
            </ul>
          </div>
        )}
         
        {currentQuestion.scientificArticle?.article_reference && (
            <div className="mt-4 w-full text-left p-4 border-t border-dashed">
              <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="scientific-article">
                <AccordionTrigger>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary"/>
                      {t('common.sourceLabel')}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="text-sm space-y-2 text-muted-foreground">
                    {currentQuestion.scientificArticle?.article_reference && (
                      <div>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-foreground">{t('common.sourceLabel')}:</p>
                          <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(currentQuestion.scientificArticle.article_reference || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary p-1"
                              title={t('common.searchOnWeb')}
                          >
                              <Search className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="whitespace-pre-wrap">
                          {currentQuestion.scientificArticle.article_reference}
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-1">
           {userRole === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Edit Question"
                title="Edit Question"
                asChild
              >
                <Link href={`/admin/edit-question?id=${currentQuestion.id}`} target="_blank" rel="noopener noreferrer">
                  <FileEdit className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Link>
              </Button>
            )}
           <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Report Issue" title="Report Issue" onClick={() => setIsReportDialogOpen(true)}>
              <AlertCircle className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleBookmarkToggle} className="h-8 w-8" aria-label={isBookmarked ? t('studyMode.removeBookmarkAria') : t('studyMode.addBookmarkAria')} title={isBookmarked ? t('studyMode.removeBookmarkTitle') : t('studyMode.addBookmarkTitle')} disabled={!firebaseUser || firebaseUser.isAnonymous}>
            <Bookmark className={`h-5 w-5 transition-colors ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-6 flex flex-col items-center gap-4">
        {!showFlashcardAnswer ? (
          <Button onClick={() => setShowFlashcardAnswer(true)} className="w-full sm:w-auto">{t('studyMode.showAnswerButton')}</Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <p className="text-sm text-muted-foreground sm:self-center mb-2 sm:mb-0">{t('studyMode.didYouKnowThis')}</p>
            <Button variant={flashcardFeedback === 'bad' ? "destructive" : "outline"} onClick={() => setFlashcardFeedback('bad')} className="w-full sm:w-auto"><ThumbsDown className="mr-2 h-4 w-4" /> {t('studyMode.didNotKnowButton')}</Button>
            <Button variant={flashcardFeedback === 'good' ? "default" : "outline"} onClick={() => setFlashcardFeedback('good')} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"><ThumbsUp className="mr-2 h-4 w-4" /> {t('studyMode.knewItButton')}</Button>
          </div>
        )}
        <div className="flex justify-between w-full mt-4">
          <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}><ArrowLeft className="mr-2 h-4 w-4" /> {t('studyMode.previousButton')}</Button>
          <Button onClick={handleNextQuestion} disabled={showFlashcardAnswer && flashcardFeedback === null && mode === 'flashcards'} >
            {currentQuestionIndex === totalQuestions - 1 ? t('studyMode.finishSessionButton') : t('studyMode.nextCardButton')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
     {isReportDialogOpen && currentQuestion && (
        <Suspense fallback={<div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ReportIssueDialog
            questionId={currentQuestion.id}
            questionStem={currentQuestion.stem ?? ''}
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
        />
        </Suspense>
    )}
    </>
  );
};

export default FlashcardDisplay;
