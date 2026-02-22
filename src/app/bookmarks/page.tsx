"use client";

import { AlertCircle, Bookmark as BookmarkIconLucide, Loader2, ChevronLeft, ChevronRight, LogIn } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuestionCard } from "@/components/questions/question-card";
import type { Question, QuestionOption, QuestionLocalization } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, query, orderBy, documentId, deleteDoc, where, type DocumentData } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { subcategoryDisplayNames } from "@/lib/constants";

const QUESTIONS_PER_PAGE = 9;

export default function BookmarksPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allBookmarkedQuestionIds, setAllBookmarkedQuestionIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAllBookmarkedIds = useCallback(async (userId: string) => {
    try {
      const bookmarksCollectionRef = collection(db, "users", userId, "bookmarkedQuestions");
      const q = query(bookmarksCollectionRef, orderBy(documentId())); 
      const bookmarkSnapshots = await getDocs(q);
      const ids = bookmarkSnapshots.docs.map(docSnap => docSnap.id);
      setAllBookmarkedQuestionIds(ids);
      return ids;
    } catch (err) {
      console.error("Error fetching all bookmark IDs:", err);
      setError(t('bookmarksPage.errorLoadingIndex'));
      return [];
    }
  }, [t]);


  const fetchPageOfQuestions = useCallback(async (page: number, allIds: string[], currentLanguage: string) => {
    if (allIds.length === 0) {
      setBookmarkedQuestions([]);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const startIndex = (page - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    const idsForPage = allIds.slice(startIndex, endIndex);

    if (idsForPage.length === 0 && page > 1) { 
        setCurrentPage(prev => prev - 1);
        setIsLoading(false);
        return;
    }
    
    try {
      const questionsQuery = query(collection(db, "questions"), where(documentId(), "in", idsForPage));
      const questionDocsSnapshot = await getDocs(questionsQuery);

      const questionsDataMap = new Map<string, DocumentData>();
      questionDocsSnapshot.forEach(doc => {
        questionsDataMap.set(doc.id, doc.data());
      });

      const fetchedQuestions: Question[] = [];
      for (const questionId of idsForPage) {
        const data = questionsDataMap.get(questionId);

        if (data) {
          const langTranslations = data.translations?.[currentLanguage] || data.translations?.en || {};
          const firestoreOptions = Array.isArray(langTranslations.options) ? langTranslations.options : [];
          
          const mappedOptions: QuestionOption[] = firestoreOptions.map((opt: { text: string }, index: number) => ({
            id: `option-${index}`, 
            text: opt.text || `Option ${index + 1}`,
          }));

          let correctAnswerIdValue: string | undefined = undefined;
          if (typeof data.correctAnswerIndex === 'number' && data.correctAnswerIndex >= 0 && data.correctAnswerIndex < mappedOptions.length) {
            correctAnswerIdValue = mappedOptions[data.correctAnswerIndex].id;
          }

          const topicDisplay = data.main_localization === "General" 
            ? t('studyMode.categoryOther') 
            : t(`topics.${data.main_localization?.toLowerCase()}` as any, {defaultValue: data.main_localization});

          const subtopicKey = data.sub_main_location;
          const subtopicTranslationKey = subtopicKey ? subcategoryDisplayNames[subtopicKey] || `subtopics.${subtopicKey.toLowerCase()}` : undefined;
          const subtopicDisplay = subtopicKey && subtopicTranslationKey ? t(subtopicTranslationKey as any, {defaultValue: subtopicKey}) : undefined;
          
          const localizationDisplay = (data.main_localization === "General" 
            ? t('studyMode.categoryOther') 
            : t(`topics.${data.main_localization?.toLowerCase()}` as any, {defaultValue: data.main_localization})) as QuestionLocalization;

          fetchedQuestions.push({
            id: questionId,
            topic: topicDisplay,
            subtopic: subtopicDisplay,
            difficulty: data.difficulty === 'Advanced' ? 'Advanced' : 'Easy',
            type: data.type || 'mcq',
            localization: localizationDisplay,
            stem: langTranslations.questionText || 'No text.',
            options: mappedOptions,
            correctAnswerId: correctAnswerIdValue || '',
            explanation: langTranslations.explanation || '',
            imageUrl: data.imageUrl || '',
            isBookmarked: true,
            scientificArticle: data.scientificArticle || undefined,
            createdAt: data.createdAt || '',
            lastUpdatedAt: data.lastUpdatedAt || '',
          });
        }
      }
      setBookmarkedQuestions(fetchedQuestions);
      setHasMore(endIndex < allIds.length);
    } catch (err: any) {
      console.error("Error fetching paged bookmarked questions:", err);
      setError(t('bookmarksPage.errorLoadingQuestions'));
      setBookmarkedQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);


  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser || firebaseUser.isAnonymous) {
      setIsLoading(false);
      setBookmarkedQuestions([]);
      setAllBookmarkedQuestionIds([]);
      setHasMore(false);
      return;
    }
    
    fetchAllBookmarkedIds(firebaseUser.uid).then(allIds => {
      fetchPageOfQuestions(currentPage, allIds, language);
    });
  }, [firebaseUser, authLoading, fetchAllBookmarkedIds, fetchPageOfQuestions, language, currentPage]);


  const handleUnbookmarkQuestion = useCallback(async (questionId: string) => {
    if (!firebaseUser || firebaseUser.isAnonymous) {
      toast({ title: t('toast.loginRequiredTitle'), description: t('toast.loginRequiredBookmarks'), variant: "destructive" });
      return;
    }

    try {
      const bookmarkDocRef = doc(db, "users", firebaseUser.uid, "bookmarkedQuestions", questionId);
      await deleteDoc(bookmarkDocRef);
      toast({ title: t('toast.bookmarkRemovedTitle'), description: t('toast.bookmarkRemovedDescription') });

      const updatedAllIds = allBookmarkedQuestionIds.filter(id => id !== questionId);
      setAllBookmarkedQuestionIds(updatedAllIds);

      if (updatedAllIds.length === 0) {
        setBookmarkedQuestions([]);
        setHasMore(false);
        setCurrentPage(1);
      } else {
        const totalPages = Math.ceil(updatedAllIds.length / QUESTIONS_PER_PAGE);
        let newCurrentPage = currentPage;
        if (currentPage > totalPages) {
          newCurrentPage = totalPages;
          setCurrentPage(totalPages);
        } else {
          fetchPageOfQuestions(newCurrentPage, updatedAllIds, language);
        }
      }

    } catch (e) {
      console.error("Error removing bookmark:", e);
      toast({ title: t('toast.errorTitle'), description: t('toast.bookmarkError'), variant: "destructive" });
    }
  }, [firebaseUser, allBookmarkedQuestionIds, currentPage, language, t, toast, fetchPageOfQuestions]);


  const handleNextPage = () => {
    if (hasMore) setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  
  if (authLoading) { 
    return (
      <div className="container mx-auto py-8 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('loading.auth')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-4">
        <BookmarkIconLucide className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('bookmarksPage.title')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t('bookmarksPage.description')}</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!firebaseUser || firebaseUser.isAnonymous ? (
        <Alert variant="default" className="shadow-lg border-primary/20 bg-primary/5">
          <LogIn className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-semibold">{t('auth.loginRequiredTitle')}</AlertTitle>
          <AlertDescription className="mt-2 text-base">
            {t('auth.loginRequiredMessageBookmarks')}{" "} 
            <Link href="/auth/login" className="font-bold text-primary underline underline-offset-4 hover:text-primary/80">
              {t('userNav.logIn')}
            </Link>
            {" "}{t('auth.loginRequiredMessageBookmarksAfterLink')}
          </AlertDescription>
        </Alert>
      ) : isLoading && bookmarkedQuestions.length === 0 && allBookmarkedQuestionIds.length > 0 ? (
         <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('loading.bookmarks')}</p>
        </div>
      ) : allBookmarkedQuestionIds.length === 0 && !isLoading ? (
        <Alert variant="default" className="shadow-md border-dashed">
          <BookmarkIconLucide className="h-5 w-5 text-muted-foreground" />
          <AlertTitle className="text-lg font-medium">{t('bookmarksPage.noBookmarksTitle')}</AlertTitle>
          <AlertDescription className="mt-1">
             {t('bookmarksPage.noBookmarksDescription')} 
             <BookmarkIconLucide className="inline h-4 w-4 mx-1 text-primary fill-primary" /> 
             {t('bookmarksPage.noBookmarksDescriptionAfterIcon')}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedQuestions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                onBookmarkToggle={handleUnbookmarkQuestion}
              />
            ))}
          </div>
          {allBookmarkedQuestionIds.length > QUESTIONS_PER_PAGE && (
            <div className="mt-10 flex justify-center items-center gap-6">
              <Button 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {t('pagination.page')} {currentPage} {t('pagination.of')} {Math.ceil(allBookmarkedQuestionIds.length / QUESTIONS_PER_PAGE)}
              </span>
              <Button 
                onClick={handleNextPage} 
                disabled={!hasMore || isLoading}
                variant="outline"
                size="sm"
              >
                {t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
