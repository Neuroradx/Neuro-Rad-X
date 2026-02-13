'use client';

import React from 'react';
import Link from 'next/link';
import type { Question, AttemptedQuestion, QuestionOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Eye, ArrowLeftCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface ExamResultsDisplayProps {
  questions: Question[];
  attemptedQuestionsData: AttemptedQuestion[];
  overallScore: number; // Percentage, e.g., 80 for 80%
  totalCorrect: number;
  totalQuestionsInSession: number;
  onReturnToConfiguration: () => void;
}

const ExamResultsDisplay: React.FC<ExamResultsDisplayProps> = ({
  questions,
  attemptedQuestionsData,
  overallScore,
  totalCorrect,
  totalQuestionsInSession,
  onReturnToConfiguration,
}) => {
  const { t } = useTranslation();

  const getOptionTextById = (options: QuestionOption[] | undefined, optionId: string | undefined): string => {
    if (!options || !optionId) return t('examResults.notAnswered', { defaultValue: 'Not Answered' });
    const selectedOpt = options.find(opt => opt.id === optionId);
    return selectedOpt?.text || t('examResults.optionNotFound', { defaultValue: 'Option not found' });
  };

  const getOptionTextByIndex = (options: QuestionOption[] | undefined, optionIndex: number | undefined): string => {
    if (!options || typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= options.length) {
      return t('examResults.notAnswered', { defaultValue: 'Not Answered' });
    }
    return options[optionIndex]?.text || t('examResults.optionNotFound', { defaultValue: 'Option not found' });
  };

  return (
    <Card className="shadow-xl overflow-hidden w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">{t('examResults.title', { defaultValue: 'Exam Results' })}</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          {t('examResults.overallScore', { defaultValue: 'Overall Score' })}: <span className="font-bold text-foreground">{overallScore.toFixed(0)}%</span>
        </CardDescription>
        <p className="text-md text-muted-foreground">
          {t('examResults.scoreDetails', {
            correct: totalCorrect.toString(),
            total: totalQuestionsInSession.toString(),
            defaultValue: 'You answered {{correct}} out of {{total}} questions correctly.'
          })}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Separator />
        <h3 className="text-xl font-semibold text-foreground">{t('examResults.questionBreakdown', { defaultValue: 'Question Breakdown' })}</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {questions.map((question, index) => {
            const attempt = attemptedQuestionsData.find(a => a.questionId === question.id);
            const isCorrect = attempt?.answeredCorrectly || false;
            const userAnswerText = getOptionTextByIndex(question.options, attempt?.selectedOptionIndex);
            // Note: The original logic used getOptionTextById for correct answer, which is good.
            const correctAnswerOption = question.options?.find(opt => opt.id === question.correctAnswerId);
            const correctAnswerText = correctAnswerOption?.text || t('examResults.correctAnswerNotFound', { defaultValue: 'Correct answer not found' });


            return (
              <Card key={question.id} className="p-4 shadow-sm bg-card border">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-md font-medium text-foreground flex-1 mr-2">
                    <span className="font-semibold">{index + 1}. </span>{question.stem}
                  </p>
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-sm space-y-1 pl-5">
                  <p>
                    <span className="font-semibold text-muted-foreground">{t('examResults.yourAnswer', { defaultValue: 'Your Answer' })}: </span>
                    <span className={isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{userAnswerText}</span>
                  </p>
                  {!isCorrect && (
                    <p>
                      <span className="font-semibold text-muted-foreground">{t('examResults.correctAnswer', { defaultValue: 'Correct Answer' })}: </span>
                      <span className="text-green-700 dark:text-green-400">{correctAnswerText}</span>
                    </p>
                  )}
                </div>
                <div className="mt-3 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/questions/${question.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('examResults.viewQuestionDetails', { defaultValue: 'View Details' })}
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="pt-6 flex justify-center">
        <Button onClick={onReturnToConfiguration} size="lg">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          {t('examResults.returnToConfiguration', { defaultValue: 'Return to Configuration' })}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamResultsDisplay;

    