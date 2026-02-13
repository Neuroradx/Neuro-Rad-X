
"use client";

// src/app/study/[mode]/page.tsx

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  limit,
  startAfter,
  DocumentData,
  orderBy,
  getCountFromServer,
  documentId,
  QueryConstraint,
  loadBundle,
} from 'firebase/firestore';

import type { Question, UserProfile } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

import { Loader2, Sparkles, AlertCircle, BarChart, GraduationCap, ClipboardCheck, Layers3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import StudyModeConfigurationScreen from '@/components/study/StudyModeConfigurationScreen';
import MCQDisplay from '@/components/study/MCQDisplay';
import FlashcardDisplay from '@/components/study/FlashcardDisplay';
import ExamResultsDisplay from '@/components/study/ExamResultsDisplay';

import { subcategoryDisplayNames } from '@/lib/constants';
import { MENU_DATA } from '@/lib/question-counts';
import { fetchIncorrectlyAnsweredQuestions, recordQuestionAttempt, saveQuizSessionAction } from '@/actions/user-data-actions';
import { DateRange } from 'react-day-picker';
import courseModuleQuestions from '@/lib/course-module-questions.json';

type Mode = 'tutor' | 'exam' | 'flashcards';

const DIFFICULTIES_FOR_FILTER = ['all', 'Easy', 'Advanced'];
const CATEGORIES_FOR_FILTER = Object.keys(MENU_DATA.main_localization);


export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useTranslation();

  const mode = params.mode as Mode;

  const [isConfigScreen, setIsConfigScreen] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionFetchError, setQuestionFetchError] = useState<string | null>(null);

  // User state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Configuration State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [numQuestions, setNumQuestions] = useState(10);
  const [displayedCategoryCountText, setDisplayedCategoryCountText] = useState<string | null>(null);
  const [isStartingReviewSession, setIsStartingReviewSession] = useState(false);

  // ECMINT filters state
  const [selectedCourse, setSelectedCourse] = useState('none');
  const [selectedEventDay, setSelectedEventDay] = useState('none');
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  // Tutor mode state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Exam mode state
  const [timer, setTimer] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [attemptedQuestionsData, setAttemptedQuestionsData] = useState<Array<{ questionId: string; selectedOptionIndex: number; answeredCorrectly: boolean }>>([]);
  const [showResults, setShowResults] = useState(false);

  // Flashcard mode state
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [flashcardFeedback, setFlashcardFeedback] = useState<'good' | 'bad' | null>(null);

  // Shared State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  // --- DERIVED DATA ---
  const availableCategories = useMemo(() => ([
    { value: 'all', label: t('studyMode.allCategories') },
    ...CATEGORIES_FOR_FILTER.map(cat => ({ value: cat, label: t(`topics.${cat.toLowerCase()}` as any, { defaultValue: cat }) }))
  ]), [t]);

  const currentSubcategoryOptions = useMemo(() => {
    if (selectedCategory === 'all' || !MENU_DATA.sub_main_location[selectedCategory]) {
      return [];
    }
    return Object.keys(MENU_DATA.sub_main_location[selectedCategory]);
  }, [selectedCategory]);
  
  const getModeTitle = useCallback(() => {
    switch(mode) {
      case 'tutor': return t('nav.tutorMode');
      case 'exam': return t('nav.examMode');
      case 'flashcards': return t('nav.flashcards');
      default: return t('studyMode.defaultTitle');
    }
  }, [mode, t]);

  const getModeDescription = useCallback(() => {
    switch(mode) {
      case 'tutor': return t('studyModes.tutor.description');
      case 'exam': return t('studyModes.exam.description');
      case 'flashcards': return t('studyModes.flashcards.description');
      default: return t('studyMode.defaultDescription');
    }
  }, [mode, t]);
  
  const getModeIcon = useCallback(() => {
    switch(mode) {
      case 'tutor': return <GraduationCap className="h-8 w-8 text-primary" />;
      case 'exam': return <ClipboardCheck className="h-8 w-8 text-primary" />;
      case 'flashcards': return <Layers3 className="h-8 w-8 text-primary" />;
      default: return <BarChart className="h-8 w-8 text-primary" />;
    }
  }, [mode]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            setFirebaseError('User profile not found.');
          }
        } catch (e: any) {
          setFirebaseError(e.message);
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
      }
      setFirebaseLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCount = () => {
      if (isConfigScreen) {
        let path = '';
        let count = 0;

        if (selectedCategory !== 'all') {
          path += t(`topics.${selectedCategory.toLowerCase()}` as any, { defaultValue: selectedCategory });
          if (selectedSubcategory !== 'all' && currentSubcategoryOptions.includes(selectedSubcategory)) {
            const subCategoryLabel = t(subcategoryDisplayNames[selectedSubcategory] || `subtopics.${selectedSubcategory.toLowerCase()}` as any, { defaultValue: selectedSubcategory });
            path += ` > ${subCategoryLabel}`;
            count = MENU_DATA.sub_main_location[selectedCategory]?.[selectedSubcategory]?.[selectedDifficulty] || 
                    MENU_DATA.total_by_sub_cat[selectedCategory]?.[selectedSubcategory] || 0;
          } else {
            count = MENU_DATA.main_localization[selectedCategory]?.[selectedDifficulty] || 
                    MENU_DATA.total_by_main_cat[selectedCategory] || 0;
          }
        } else {
          count = Object.values(MENU_DATA.total_by_main_cat).reduce((acc, current) => acc + current, 0);
          path = t('studyMode.allCategories'); 
        }
        
        setDisplayedCategoryCountText(t('common.approxQuestionsForFilterCombination', { count: count.toString(), path }));
      }
    };
    updateCount();
}, [selectedCategory, selectedSubcategory, selectedDifficulty, isConfigScreen, t, currentSubcategoryOptions]);

  const fetchAndSetQuestions = async (questionIds: string[]) => {
    try {
      const questionDocs = await Promise.all(questionIds.map(id => getDoc(doc(db, 'questions', id))));
      const fetchedQuestions = questionDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => {
          const data = docSnap.data();
          const lang = language;
          const translations = data.translations || {};
          const langTranslations = translations[lang] || translations.en || {};
          
          let options: { id: string; text: string }[] = [];
          if (langTranslations.options) {
            options = langTranslations.options.map((opt: { text: string }, index: number) => ({
              id: `${docSnap.id}-opt-${index}`,
              text: opt.text,
            }));
          }
          
          const correctAnswerId = options[data.correctAnswerIndex]?.id;

          return {
            id: docSnap.id,
            topic: t(`topics.${data.main_localization.toLowerCase()}` as any, { defaultValue: data.main_localization }),
            subtopic: data.sub_main_location ? t(subcategoryDisplayNames[data.sub_main_location] || `subtopics.${data.sub_main_location.toLowerCase()}` as any, { defaultValue: data.sub_main_location }) : undefined,
            difficulty: data.difficulty,
            type: data.type,
            stem: langTranslations.questionText,
            options: options,
            correctAnswerId: correctAnswerId,
            explanation: langTranslations.explanation || '',
            imageUrl: data.imageUrl,
            scientificArticle: data.scientificArticle,
          } as Question;
        });

      if (fetchedQuestions.length === 0) {
        throw new Error('No matching questions found.');
      }

      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setIsConfigScreen(false);
      setAttemptedQuestionsData([]); // Reset attempts for new session
    } catch (e: any) {
      setQuestionFetchError(e.message);
    } finally {
      setIsLoadingQuestions(false);
      setIsStartingReviewSession(false);
    }
  };
  
  const startSession = async () => {
    setIsLoadingQuestions(true);
    setQuestionFetchError(null);
    setQuestions([]);

    try {
        // --- BUNDLE OPTIMIZATION START ---
        // If a category is selected and no course filter is active, attempt to load the bundle.
        // Bundles are pre-calculated binaries served via CDN to reduce Firestore read costs.
        if (selectedCategory !== 'all' && selectedCourse === 'none') {
          console.log(`[Bundles] Attempting to load bundle for category: ${selectedCategory}`);
          try {
            const response = await fetch(`/api/bundles/${selectedCategory.toLowerCase()}`);
            if (response.ok && response.body) {
              // Load the bundle into the local Firestore cache.
              // Subsequent queries for these documents will now be served from cache.
              await loadBundle(db, response.body);
              console.log(`[Bundles] Bundle for ${selectedCategory} loaded successfully.`);
            } else {
              console.warn(`[Bundles] Failed to fetch bundle: ${response.statusText}. Falling back to live query.`);
            }
          } catch (bundleError) {
            console.error("[Bundles] Error loading bundle:", bundleError);
          }
        }
        // --- BUNDLE OPTIMIZATION END ---

        let questionIds: string[] = [];

        // Handle ECMINT course filters first as they are exclusive
        if (selectedCourse === 'ecmint_6.1') {
            const courseData = (courseModuleQuestions as any)['ecmint_6.1'];
            if (selectedEventDay !== 'none') {
                questionIds = courseData[selectedEventDay] || [];
            } else {
                questionIds = Object.values(courseData).flat() as string[];
            }
        } else {
            // Standard category/difficulty query
            const constraints: QueryConstraint[] = [];
            if (selectedCategory !== 'all') {
                constraints.push(where('main_localization', '==', selectedCategory));
            }
            if (selectedSubcategory !== 'all' && currentSubcategoryOptions.includes(selectedSubcategory)) {
                constraints.push(where('sub_main_location', '==', selectedSubcategory));
            }
            if (selectedDifficulty !== 'all') {
                constraints.push(where('difficulty', '==', selectedDifficulty));
            }

            const q = query(collection(db, 'questions'), ...constraints);
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                questionIds.push(doc.id);
            });
        }

        if (questionIds.length === 0) {
            setQuestionFetchError(selectedCourse !== 'none' ? t('studyMode.noQuestionsForSourceFilter') : t('studyMode.noQuestionsMatch'));
            setIsLoadingQuestions(false);
            return;
        }

        const shuffled = questionIds.sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, numQuestions);
        
        if (selectedIds.length === 0) {
          setQuestionFetchError(t('studyMode.noQuestionsMatch'));
          setIsLoadingQuestions(false);
          return;
        }

        await fetchAndSetQuestions(selectedIds);

    } catch (error: any) {
        console.error("Error starting session: ", error);
        setQuestionFetchError(error.message || "An unknown error occurred while fetching questions.");
        setIsLoadingQuestions(false);
    }
  };

  const handleStartReviewSession = async () => {
    if (!firebaseUser) return;
    setIsStartingReviewSession(true);
    const result = await fetchIncorrectlyAnsweredQuestions(firebaseUser.uid);
    if (result.success && result.questionIds && result.questionIds.length > 0) {
      await fetchAndSetQuestions(result.questionIds);
    } else {
      setQuestionFetchError(t('studyMode.reviewMistakes.noMistakesDescription'));
      setIsStartingReviewSession(false);
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // 1. Determine results for the current question
    let isCorrect = false;
    let selectedIdx = -1;

    if (mode === 'tutor' || mode === 'exam') {
      if (selectedOptionId) {
        selectedIdx = currentQuestion.options.findIndex(opt => opt.id === selectedOptionId);
        isCorrect = selectedOptionId === currentQuestion.correctAnswerId;
      }
    } else if (mode === 'flashcards') {
      isCorrect = flashcardFeedback === 'good';
    }

    // 2. Save progress to DB (Fire and forget following guidelines)
    if (firebaseUser) {
      // Record individual attempt and update distributed counters
      recordQuestionAttempt(firebaseUser.uid, currentQuestion.id, isCorrect);
      
      // If it's an exam, add to local accumulation
      if (mode === 'exam') {
        setAttemptedQuestionsData(prev => [...prev, {
          questionId: currentQuestion.id,
          selectedOptionIndex: selectedIdx,
          answeredCorrectly: isCorrect
        }]);
      }
    }
    
    // 3. Navigation
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Reset states for next question
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setShowFlashcardAnswer(false);
      setFlashcardFeedback(null);
    } else {
      // End of session
      if (mode === 'exam') {
        // Save full session summary
        if (firebaseUser) {
          const finalAttempts = [...attemptedQuestionsData, {
            questionId: currentQuestion.id,
            selectedOptionIndex: selectedIdx,
            answeredCorrectly: isCorrect
          }];
          const correctCount = finalAttempts.filter(a => a.answeredCorrectly).length;
          
          saveQuizSessionAction(firebaseUser.uid, {
            quizConfig: {
              difficulty: selectedDifficulty,
              mainLocalization: selectedCategory,
              subMainLocalization: selectedSubcategory,
              numberOfQuestions: questions.length,
              mode: mode
            },
            score: Math.round((correctCount / questions.length) * 100),
            correctAnswers: correctCount,
            incorrectAnswers: questions.length - correctCount,
            actualNumberOfQuestions: questions.length,
            questionsAttempted: finalAttempts
          });
        }
        setShowResults(true);
      } else {
        setIsConfigScreen(true);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setShowFlashcardAnswer(false);
      setFlashcardFeedback(null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  if (firebaseLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (firebaseError) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{firebaseError}</AlertDescription></Alert>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
    {isConfigScreen ? (
        <StudyModeConfigurationScreen
            mode={mode}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            currentSubcategoryOptions={currentSubcategoryOptions}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            startSession={startSession}
            isLoadingQuestions={isLoadingQuestions}
            questionFetchError={questionFetchError}
            firebaseLoading={firebaseLoading}
            firebaseError={firebaseError}
            availableCategories={availableCategories}
            difficultiesForFilter={DIFFICULTIES_FOR_FILTER}
            getModeTitle={getModeTitle}
            getModeDescription={getModeDescription}
            getModeIcon={getModeIcon}
            routerPush={router.push}
            displayedCategoryCountText={displayedCategoryCountText}
            userProfile={userProfile}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            selectedEventDay={selectedEventDay}
            onEventDayChange={setSelectedEventDay}
            date={date}
            onDateChange={setDate}
            onStartReviewSession={handleStartReviewSession}
            isStartingReviewSession={isStartingReviewSession}
        />
    ) : showResults && mode === 'exam' ? (
        <ExamResultsDisplay 
           questions={questions}
           attemptedQuestionsData={attemptedQuestionsData}
           overallScore={(attemptedQuestionsData.filter(a => a.answeredCorrectly).length / questions.length) * 100}
           totalCorrect={attemptedQuestionsData.filter(a => a.answeredCorrectly).length}
           totalQuestionsInSession={questions.length}
           onReturnToConfiguration={() => {
              setIsConfigScreen(true);
              setShowResults(false);
           }}
        />
    ) : (
      <>
        {mode === 'tutor' || mode === 'exam' ? (
            <MCQDisplay
                currentQuestion={currentQuestion}
                mode={mode}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                timer={timer}
                selectedOptionId={selectedOptionId}
                isAnswerSubmitted={isAnswerSubmitted}
                isBookmarked={isBookmarked}
                userNotes={userNotes}
                isConfigScreen={isConfigScreen}
                userRole={userProfile?.role || 'user'}
                handleOptionChange={setSelectedOptionId}
                handleSubmitAnswer={() => setIsAnswerSubmitted(true)}
                handleNextQuestion={handleNextQuestion}
                handlePreviousQuestion={handlePreviousQuestion}
                handleBookmarkToggle={async () => {}}
                handleSaveNotes={async () => {}}
                setUserNotes={setUserNotes}
                handleRequestExamExit={() => setIsConfigScreen(true)}
                firebaseUser={firebaseUser}
                db={db}
            />
        ) : mode === 'flashcards' ? (
            <FlashcardDisplay
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                showFlashcardAnswer={showFlashcardAnswer}
                flashcardFeedback={flashcardFeedback}
                isBookmarked={isBookmarked}
                mode={mode}
                userRole={userProfile?.role || 'user'}
                setShowFlashcardAnswer={setShowFlashcardAnswer}
                setFlashcardFeedback={setFlashcardFeedback}
                handleNextQuestion={handleNextQuestion}
                handlePreviousQuestion={handlePreviousQuestion}
                handleBookmarkToggle={async () => {}}
                firebaseUser={firebaseUser}
                db={db}
            />
        ) : null}
      </>
    )}
    </Suspense>
  );
}
