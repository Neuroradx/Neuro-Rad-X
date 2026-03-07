'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Sparkles, ArrowLeft, Info, X, ShieldAlert } from "lucide-react";
import { useTranslation } from '@/hooks/use-translation';
import { getSubtopicDisplayName } from '@/lib/formatting';
import type { UserProfile } from '@/types';
import { Separator } from '../ui/separator';
import { DatePickerWithRange } from '../ui/date-picker-with-range';
import type { DateRange } from 'react-day-picker';

interface StudyModeConfigurationScreenProps {
  mode: 'tutor' | 'exam' | 'flashcards';
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
  currentSubcategoryOptions: string[];
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  numQuestions: number;
  setNumQuestions: (value: number) => void;
  startSession: () => void;
  isLoadingQuestions: boolean;
  questionFetchError: string | null;
  firebaseLoading: boolean;
  firebaseError: string | null;
  availableCategories: Array<{ value: string, label: string }>;
  difficultiesForFilter: string[];
  getModeTitle: () => string;
  getModeDescription: () => string;
  getModeIcon: () => JSX.Element;
  routerPush: (path: string) => void;
  displayedCategoryCountText: string | null;
  userProfile: UserProfile | null;
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  selectedEventDay: string;
  onEventDayChange: (value: string) => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  onStartReviewSession: () => void;
  isStartingReviewSession: boolean;
}

const StudyModeConfigurationScreen: React.FC<StudyModeConfigurationScreenProps> = ({
  mode,
  selectedCategory, onCategoryChange,
  selectedSubcategory, setSelectedSubcategory,
  currentSubcategoryOptions,
  selectedDifficulty, setSelectedDifficulty,
  numQuestions, setNumQuestions,
  startSession,
  isLoadingQuestions, questionFetchError,
  firebaseLoading, firebaseError,
  availableCategories, difficultiesForFilter,
  getModeTitle, getModeDescription, getModeIcon,
  routerPush,
  displayedCategoryCountText,
  userProfile,
  selectedCourse, onCourseChange,
  selectedEventDay, onEventDayChange,
  date, onDateChange,
  onStartReviewSession,
  isStartingReviewSession
}) => {
  const { t } = useTranslation();

  const sortedSubcategoryItems = useMemo(() => {
    if (!currentSubcategoryOptions) {
      return [];
    }
    return currentSubcategoryOptions
      .map(subcatKey => ({
        value: subcatKey,
        label: getSubtopicDisplayName(subcatKey, t),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [currentSubcategoryOptions, t]);

  const questionsAnswered = userProfile?.totalQuestionsAnsweredAllTime ?? 0;
  const questionsLeft = Math.max(0, 50 - questionsAnswered);
  const isTrial = userProfile?.subscriptionLevel === 'Trial';

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
        setNumQuestions(1); // Or some other default if input is cleared
    } else {
        // Enforce min and max limits
        const limitedValue = Math.max(1, Math.min(100, value));
        setNumQuestions(limitedValue);
    }
  };


  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <Button onClick={() => routerPush('/dashboard')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('studyMode.backToDashboard')}
      </Button>
      
      <Card className="shadow-xl mb-8">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            {getModeIcon()}
            <CardTitle className="text-2xl sm:text-3xl font-bold">{getModeTitle()}</CardTitle>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('studyMode.stepLabel')}
          </p>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            {getModeDescription()}
          </CardDescription>
        </CardHeader>
        
        {isTrial && (
          <CardContent className="pb-0 pt-4 px-4 sm:px-6">
            <Alert variant="default" className="border-primary/50 bg-primary/5 dark:bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="font-bold text-primary">{t('studyMode.trialMessage.title')}</AlertTitle>
              <AlertDescription className="text-foreground/90">
                {questionsLeft > 0 ? 
                  t('studyMode.trialMessage.description', { remaining: questionsLeft.toString() }) :
                  t('studyMode.trialMessage.noQuestionsLeft')
                }
                {' '}
                <Link href="/settings" className="font-semibold underline hover:text-primary/80">
                  {t('studyMode.trialMessage.upgradeLink')}
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <CardContent className="space-y-8 px-4 sm:px-6">
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('studyMode.sections.questionPoolTitle')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('studyMode.sections.questionPoolDescription')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="category-select" className="mb-2 block font-medium">{t('studyMode.categoryLabel')}</Label>
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder={t('studyMode.selectCategoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory === 'all' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('studyMode.allCategories')} – {t('studyMode.sections.questionPoolAllHelper', { defaultValue: 'Includes all topics.' })}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="subcategory-select" className="mb-2 block font-medium">{t('studyMode.subcategoryLabel')}</Label>
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                  disabled={selectedCategory === "all" || currentSubcategoryOptions.length === 0}
                >
                  <SelectTrigger id="subcategory-select">
                    <SelectValue placeholder={t('studyMode.selectSubcategoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('studyMode.allSubcategories')}</SelectItem>
                    {sortedSubcategoryItems.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty-select" className="mb-2 block font-medium">{t('studyMode.difficultyLabel')}</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger id="difficulty-select">
                    <SelectValue placeholder={t('studyMode.selectDifficultyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultiesForFilter.map(diff => (
                      <SelectItem key={diff} value={diff} className="capitalize">
                        {diff === "all" ? t('difficulty.all') : t(`difficulty.${diff.toLowerCase()}` as any) || diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('studyMode.sections.sessionSettingsTitle')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('studyMode.sections.sessionSettingsDescription')}
              </p>
            </div>

            <div>
              <Label htmlFor="num-questions" className="mb-2 block font-medium">{t('studyMode.numQuestionsLabel')}</Label>
              <Input 
                  id="num-questions" 
                  type="number" 
                  value={numQuestions} 
                  onChange={handleNumQuestionsChange} 
                  min="1" 
                  max="100"
                  className="shadow-inner"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('studyMode.sections.numQuestionsHelper')}
              </p>
            </div>

            {displayedCategoryCountText && (
              <div className="flex justify-center pt-1">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  {displayedCategoryCountText}
                </span>
              </div>
            )}
          </section>

          {isLoadingQuestions && (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('loading.fetchingQuestions')}
            </div>
          )}
          {questionFetchError && !isLoadingQuestions && (
             <Alert variant="default" className="shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('common.note')}</AlertTitle>
              <AlertDescription>{questionFetchError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="px-4 sm:px-6 pb-6">
          <Button
            onClick={startSession}
            size="lg"
            className="w-full shadow-lg py-3 text-base font-semibold"
            disabled={isLoadingQuestions || firebaseLoading || !!firebaseError}
          >
            {isLoadingQuestions ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('loading.fetchingQuestions')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t('studyMode.startSessionButton', { mode: getModeTitle() })}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-md mt-10 border border-primary/10 bg-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary text-base">
            <ShieldAlert className="h-5 w-5" />
            {t('studyMode.reviewMistakes.title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t('studyMode.reviewMistakes.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
              onClick={onStartReviewSession} 
              size="default" 
              className="w-full"
              variant="secondary"
              disabled={isLoadingQuestions || firebaseLoading || !!firebaseError || isStartingReviewSession}
          >
              {isStartingReviewSession ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldAlert className="mr-2 h-5 w-5" />}
              {t('studyMode.reviewMistakes.buttonText')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyModeConfigurationScreen;

    