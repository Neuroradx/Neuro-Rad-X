
'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuestionOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, ArrowLeft, CheckCircle, Lightbulb, MessageSquare, XCircle, Bookmark, ChevronRight, FileEdit, ShieldCheck, FileText, Search, Loader2 } from "lucide-react";
import { useTranslation } from '@/hooks/use-translation';
import type { User as FirebaseUser } from "firebase/auth";
import type { Firestore } from 'firebase/firestore';
import { ReportIssueDialog } from '@/components/questions/report-issue-dialog';
import Link from 'next/link';

interface MCQDisplayProps {
  currentQuestion: Question | null;
  mode: 'tutor' | 'exam';
  currentQuestionIndex: number;
  totalQuestions: number;
  timer: number;
  selectedOptionId: string | null;
  isAnswerSubmitted: boolean;
  isBookmarked: boolean;
  userNotes: string;
  isConfigScreen: boolean;
  userRole: string | null;
  handleOptionChange: (value: string) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => Promise<void>;
  handlePreviousQuestion: () => void;
  handleBookmarkToggle: () => Promise<void>;
  handleSaveNotes: () => Promise<void>;
  setUserNotes: (notes: string) => void;
  handleRequestExamExit: () => void;
  firebaseUser: FirebaseUser | null;
  db: Firestore | null;
}

const MCQDisplay: React.FC<MCQDisplayProps> = ({
  currentQuestion,
  mode,
  currentQuestionIndex,
  totalQuestions,
  timer,
  selectedOptionId,
  isAnswerSubmitted,
  isBookmarked,
  userNotes,
  isConfigScreen,
  userRole,
  handleOptionChange,
  handleSubmitAnswer,
  handleNextQuestion,
  handlePreviousQuestion,
  handleBookmarkToggle,
  handleSaveNotes,
  setUserNotes,
  handleRequestExamExit,
  firebaseUser,
  db
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  if (!currentQuestion) return null;

  const isCorrect = selectedOptionId === currentQuestion.correctAnswerId;
  const difficultyText = t(`difficulty.${currentQuestion.difficulty.toLowerCase()}` as any);
  
  const displayTopic = currentQuestion.topic;
  const displaySubtopic = currentQuestion.subtopic || '';


  return (
    <>
      <Card className="shadow-xl overflow-hidden" key={currentQuestion.id || currentQuestionIndex}>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl">{displayTopic}{displaySubtopic ? `: ${displaySubtopic}` : ''}</CardTitle>
            <div className="text-right">
              <p className="text-sm font-semibold capitalize text-primary">{t('common.difficultyLabelWithColon', { difficulty: difficultyText })}</p>
            </div>
          </div>
          {mode === 'exam' && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('studyMode.questionProgress', { current: (currentQuestionIndex + 1).toString(), total: totalQuestions.toString() })}</span>
              <span>{t('studyMode.timeLabel')}: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
           {mode === 'tutor' && (<p className="text-sm text-muted-foreground">{t('studyMode.questionProgress', { current: (currentQuestionIndex + 1).toString(), total: totalQuestions.toString() })}</p>)}
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="w-full mt-1 h-2" />
        </CardHeader>

        <CardContent className="space-y-6 relative pb-12">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{currentQuestion.stem}</p>

          <RadioGroup
            onValueChange={handleOptionChange}
            value={selectedOptionId || undefined}
            disabled={(isAnswerSubmitted && mode === 'tutor')}
          >
            {currentQuestion.options?.map((option) => {
              let optionStyle = "border-border hover:border-primary";
              if (mode === 'tutor' && isAnswerSubmitted) {
                if (option.id === currentQuestion.correctAnswerId) optionStyle = "border-green-500 bg-green-500/10";
                else if (option.id === selectedOptionId && !isCorrect) optionStyle = "border-red-500 bg-red-500/10";
              } else if (mode === 'exam' && option.id === selectedOptionId) {
                optionStyle = "border-primary bg-primary/10";
              }
              return (
                <Label key={option.id} htmlFor={option.id} className={`flex items-center space-x-3 p-4 border rounded-md transition-all cursor-pointer ${optionStyle}`}>
                  <RadioGroupItem value={option.id} id={option.id} />
                  <span>{option.text}</span>
                  {mode === 'tutor' && isAnswerSubmitted && option.id === currentQuestion.correctAnswerId && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
                  {mode === 'tutor' && isAnswerSubmitted && option.id === selectedOptionId && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
                </Label>
              );
            })}
          </RadioGroup>

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
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t('studyMode.reportIssueAria')} title={t('studyMode.reportIssueTitle')} onClick={() => setIsReportDialogOpen(true)}>
                <AlertCircle className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBookmarkToggle} className="h-8 w-8" aria-label={isBookmarked ? t('studyMode.removeBookmarkAria') : t('studyMode.addBookmarkAria')} title={isBookmarked ? t('studyMode.removeBookmarkTitle') : t('studyMode.addBookmarkTitle')} disabled={!firebaseUser || firebaseUser.isAnonymous}>
              <Bookmark className={`h-5 w-5 transition-colors ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
            </Button>
          </div>
        </CardContent>

        {mode === 'tutor' && isAnswerSubmitted && (
          <><Separator /><CardContent className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" /> {t('studyMode.explanationTitle')}</h3>
              {isCorrect ? (
                <Alert variant="default" className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" /><AlertTitle className="font-semibold">{t('studyMode.correctTitle')}</AlertTitle>
                  <AlertDescription>{currentQuestion.explanation || t('studyMode.correctDefaultExplanation')}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" /><AlertTitle className="font-semibold">{t('studyMode.incorrectTitle')}</AlertTitle>
                  <AlertDescription>{currentQuestion.explanation || t('studyMode.incorrectDefaultExplanation')}</AlertDescription>
                </Alert>
              )}
          </CardContent></>
        )}

        <Separator />
        <CardContent className="pt-6 space-y-4">
           {currentQuestion.scientificArticle?.article_reference && (
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
                              href={`https://www.google.com/search?q=${encodeURIComponent(currentQuestion.scientificArticle.article_reference)}`}
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
          )}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="my-notes-study-mode">
              <AccordionTrigger>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> {t('studyMode.myNotesTitle')}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <Textarea placeholder={!firebaseUser || firebaseUser.isAnonymous ? t('singleQuestionPage.notesLoginPlaceholder', {defaultValue: 'Please log in to add notes.'}) : t('studyMode.notesPlaceholder')} value={userNotes} onChange={(e) => setUserNotes(e.target.value)} rows={3} className="shadow-inner" disabled={!firebaseUser || firebaseUser.isAnonymous}/>
                <Button variant="secondary" size="sm" onClick={handleSaveNotes} disabled={!firebaseUser || firebaseUser.isAnonymous}>{t('studyMode.saveNotesButton')}</Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>

        <CardFooter className="pt-6 flex justify-between items-center">
          {mode === 'exam' && !isConfigScreen && (
             <Button variant="outline" onClick={handleRequestExamExit}>
               {t('studyMode.quitExamButton')}
             </Button>
          )}
          { (mode !== 'exam' || (mode === 'exam' && isConfigScreen)) &&
             <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
               <ArrowLeft className="mr-2 h-4 w-4" /> {t('studyMode.previousButton')}
             </Button>
          }
           {mode === 'exam' && !isConfigScreen && currentQuestionIndex === 0 && !isConfigScreen && <div className="w-[calc(10ch+1rem)] invisible"></div> /* Placeholder for alignment */}


          {mode === 'tutor' && !isAnswerSubmitted && (<Button onClick={handleSubmitAnswer} disabled={!selectedOptionId}>{t('studyMode.submitAnswerButton')}</Button>)}

          {((mode === 'tutor' && isAnswerSubmitted) || (mode === 'exam' && !!selectedOptionId) || (mode === 'exam' && !selectedOptionId && currentQuestionIndex === totalQuestions -1 )) ? (
            <Button onClick={handleNextQuestion} disabled={mode === 'exam' && !selectedOptionId && currentQuestionIndex < totalQuestions -1}>
              {currentQuestionIndex === totalQuestions - 1 ? t('studyMode.finishSessionButton') : t('studyMode.nextQuestionButton')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : mode === 'exam' && !selectedOptionId ? ( 
            <Button disabled> 
              {currentQuestionIndex === totalQuestions - 1 ? t('studyMode.finishSessionButton') : t('studyMode.nextQuestionButton')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
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

export default MCQDisplay;
