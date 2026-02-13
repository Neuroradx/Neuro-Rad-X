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
import { subcategoryDisplayNames } from '@/lib/constants';
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
        label: t(subcategoryDisplayNames[subcatKey] || `subtopics.${subcatKey.toLowerCase()}` as any, { defaultValue: subcatKey }),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [currentSubcategoryOptions, t]);

  const questionsAnswered = userProfile?.totalQuestionsAnsweredAllTime ?? 0;
  const questionsLeft = Math.max(0, 50 - questionsAnswered);
  const isTrial = userProfile?.subscriptionLevel === 'Trial';

  const showSourceFilters = userProfile?.role === 'admin' || userProfile?.subscriptionLevel === 'ECMINT' || userProfile?.subscriptionLevel === 'Evaluator';
  
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
    <div className="max-w-2xl mx-auto">
      <Button onClick={() => routerPush('/dashboard')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('studyMode.backToDashboard')}
      </Button>
      
      <Card className="shadow-xl mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {getModeIcon()}
            <CardTitle className="text-3xl font-bold">{getModeTitle()}</CardTitle>
          </div>
          <CardDescription className="text-lg">{getModeDescription()}</CardDescription>
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
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="category-select" className="mb-2 block font-medium">{t('studyMode.categoryLabel')}</Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange} disabled={(showSourceFilters && selectedCourse !== 'none')}>
              <SelectTrigger id="category-select"><SelectValue placeholder={t('studyMode.selectCategoryPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {availableCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory-select" className="mb-2 block font-medium">{t('studyMode.subcategoryLabel')}</Label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={selectedCategory === "all" || currentSubcategoryOptions.length === 0 || (showSourceFilters && selectedCourse !== 'none')}>
              <SelectTrigger id="subcategory-select"><SelectValue placeholder={t('studyMode.selectSubcategoryPlaceholder')} /></SelectTrigger>
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
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty} disabled={(showSourceFilters && selectedCourse !== 'none')}>
              <SelectTrigger id="difficulty-select"><SelectValue placeholder={t('studyMode.selectDifficultyPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {difficultiesForFilter.map(diff => (
                  <SelectItem key={diff} value={diff} className="capitalize">
                    {diff === "all" ? t('difficulty.all') : t(`difficulty.${diff.toLowerCase()}` as any) || diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSourceFilters && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2 mb-4">
                 <h3 className="text-lg font-semibold text-primary">{t('studyMode.sourceFilter.ecmintCoursesTitle')}</h3>
                 <p className="text-sm text-muted-foreground">{t('studyMode.sourceFilter.description')}</p>
              </div>

              <div className="mt-6">
                <Label htmlFor="course-select" className="mb-2 block font-medium">{t('studyMode.sourceFilter.chooseCourseLabel')}</Label>
                <Select value={selectedCourse} onValueChange={onCourseChange}>
                    <SelectTrigger id="course-select">
                        <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t('studyMode.sourceFilter.courseNone')}</SelectItem>
                        <SelectItem value="ecmint_6.1">{t('studyMode.sourceFilter.course61')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {selectedCourse === 'ecmint_6.1' && (
                  <div className="mt-6">
                    <Label htmlFor="event-day-select" className="mb-2 block font-medium">{t('studyMode.sourceFilter.ecmintDayLabel')}</Label>
                    <Select value={selectedEventDay} onValueChange={onEventDayChange}>
                      <SelectTrigger id="event-day-select">
                        <SelectValue placeholder={t('studyMode.sourceFilter.ecmintDayPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('studyMode.sourceFilter.ecmintDayNone')}</SelectItem>
                        <SelectItem value="scientific_articles">{t('studyMode.sourceFilter.ecmintScientificArticles')}</SelectItem>
                        <SelectItem value="ecmint_day_1">{t('studyMode.sourceFilter.ecmintFirstDay')}</SelectItem>
                        <SelectItem value="ecmint_day_2">{t('studyMode.sourceFilter.ecmintSecondDay')}</SelectItem>
                        <SelectItem value="ecmint_day_3">{t('studyMode.sourceFilter.ecmintThirdDay')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="num-questions" className="mb-2 block font-medium">{t('studyMode.numQuestionsLabel')}</Label>
            <Input 
                id="num-questions" 
                type="number" 
                value={numQuestions} 
                onChange={handleNumQuestionsChange} 
                min="1" 
                max="100" // Set maximum limit
                className="shadow-inner"
            />
          </div>

          {displayedCategoryCountText && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              {displayedCategoryCountText}
            </p>
          )}

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
        <CardFooter>
          <Button onClick={startSession} size="lg" className="w-full shadow-lg" disabled={isLoadingQuestions || firebaseLoading || !!firebaseError}>
            {isLoadingQuestions ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {t('studyMode.startSessionButton', { mode: getModeTitle() })}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-xl mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-5 w-5" />
            {t('studyMode.reviewMistakes.title')}
          </CardTitle>
          <CardDescription>
            {t('studyMode.reviewMistakes.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
              onClick={onStartReviewSession} 
              size="lg" 
              className="w-full shadow-lg" 
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

    