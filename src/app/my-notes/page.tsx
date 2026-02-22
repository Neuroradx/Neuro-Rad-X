"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Loader2, NotebookText, Save, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Question, QuestionOption, UserNote } from "@/types";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, orderBy, serverTimestamp, setDoc, deleteDoc, type Timestamp, where, documentId, type DocumentData } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NOTES_PER_PAGE = 5;

interface NoteWithQuestion {
  note: UserNote;
  question: Question | null;
}

export default function MyNotesPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [allNotesMeta, setAllNotesMeta] = useState<UserNote[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<NoteWithQuestion[]>([]);
  const [editableNotes, setEditableNotes] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isSavingNote, setIsSavingNote] = useState<Record<string, boolean>>({});
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAllNotesMetadata = useCallback(async (userId: string): Promise<UserNote[]> => {
    try {
      const notesCollectionRef = collection(db, "users", userId, "questionNotes");
      const q = query(notesCollectionRef, orderBy("updatedAt", "desc"));
      const notesSnapshots = await getDocs(q);
      const notes: UserNote[] = notesSnapshots.docs.map(docSnap => ({
        id: docSnap.id,
        notes: docSnap.data().notes || "",
        updatedAt: docSnap.data().updatedAt as Timestamp,
      }));
      setAllNotesMeta(notes);
      return notes;
    } catch (err) {
      console.error("Error fetching all notes metadata:", err);
      setError(t('myNotesPage.errorLoadingNotesMeta'));
      return [];
    }
  }, [t]);

  const fetchPageOfNotesWithQuestions = useCallback(async (page: number, notesMeta: UserNote[], currentLanguage: string) => {
    if (notesMeta.length === 0) {
      setDisplayedNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const startIndex = (page - 1) * NOTES_PER_PAGE;
    const endIndex = startIndex + NOTES_PER_PAGE;
    const notesForPageMeta = notesMeta.slice(startIndex, endIndex);

    if (notesForPageMeta.length === 0 && page > 1) {
        const adjustedPage = Math.max(1, page - 1);
        setCurrentPage(adjustedPage);
        return;
    }
    if (notesForPageMeta.length === 0) {
        setDisplayedNotes([]);
        setIsLoading(false);
        return;
    }

    try {
        const questionIds = notesForPageMeta.map(note => note.id);
        const questionsQuery = query(collection(db, "questions"), where(documentId(), "in", questionIds));
        const questionDocsSnapshot = await getDocs(questionsQuery);
        
        const questionsDataMap = new Map<string, DocumentData>();
        questionDocsSnapshot.forEach(doc => {
            questionsDataMap.set(doc.id, doc.data());
        });

        const fetchedNotesWithData: NoteWithQuestion[] = [];
        const initialEditableNotes: Record<string, string> = {};

        for (const noteMeta of notesForPageMeta) {
            initialEditableNotes[noteMeta.id] = noteMeta.notes;
            let questionData: Question | null = null;
            const data = questionsDataMap.get(noteMeta.id);

            if (data) {
                const langTranslations = data.translations?.[currentLanguage] || data.translations?.en || {};
                const firestoreOptions = Array.isArray(langTranslations.options) ? langTranslations.options : [];
                const mappedOptions: QuestionOption[] = firestoreOptions.map((opt: { text: string }, index: number) => ({
                    id: `option-${index}`,
                    text: opt.text || `Option ${index + 1} text missing`,
                }));
                let correctAnswerIdValue: string | undefined = undefined;
                if (typeof data.correctAnswerIndex === 'number' && data.correctAnswerIndex >= 0 && data.correctAnswerIndex < mappedOptions.length) {
                    correctAnswerIdValue = mappedOptions[data.correctAnswerIndex].id;
                }
                questionData = {
                    id: noteMeta.id,
                    topic: data.main_localization === "General" ? t('studyMode.categoryOther') : t(`topics.${data.main_localization?.toLowerCase()}` as any, { defaultValue: data.main_localization }),
                    subtopic: data.sub_main_location || undefined,
                    difficulty: data.difficulty === 'Advanced' ? 'Advanced' : 'Easy',
                    type: (data.type === "Multiple Choice" || data.type === "multiple_choice") ? 'mcq' : data.type || 'mcq',
                    localization: (data.main_localization === "General" ? t('studyMode.categoryOther') : t(`topics.${data.main_localization?.toLowerCase()}` as any, { defaultValue: data.main_localization })) as any,
                    stem: langTranslations.questionText || 'No stem available.',
                    options: mappedOptions,
                    correctAnswerId: correctAnswerIdValue,
                    explanation: langTranslations.explanation || undefined,
                };
            }
            fetchedNotesWithData.push({ note: noteMeta, question: questionData });
        }
        setDisplayedNotes(fetchedNotesWithData);
        setEditableNotes(prev => ({ ...prev, ...initialEditableNotes }));
    } catch (err: any) {
        console.error("Error fetching paged notes with questions:", err);
        setError(t('myNotesPage.errorLoadingFullNotes'));
        setDisplayedNotes([]);
    } finally {
        setIsLoading(false);
    }
}, [t]);


  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser || firebaseUser.isAnonymous) {
      setIsLoading(false);
      setAllNotesMeta([]);
      setDisplayedNotes([]);
      return;
    }
    
    fetchAllNotesMetadata(firebaseUser.uid).then(allMeta => {
      fetchPageOfNotesWithQuestions(currentPage, allMeta, language);
    });

  }, [firebaseUser, authLoading, fetchAllNotesMetadata, fetchPageOfNotesWithQuestions, language, currentPage]);

  const handleNoteTextChange = (questionId: string, text: string) => {
    setEditableNotes(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSaveNote = async (questionId: string) => {
    if (!firebaseUser || firebaseUser.isAnonymous) {
      toast({ title: t('toast.loginRequiredTitle'), description: t('toast.loginRequiredNotes'), variant: "destructive" });
      return;
    }
    setIsSavingNote(prev => ({ ...prev, [questionId]: true }));
    const noteText = editableNotes[questionId];

    try {
      const noteDocRef = doc(db, "users", firebaseUser.uid, "questionNotes", questionId);
      await setDoc(noteDocRef, { notes: noteText, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: t('toast.notesSavedTitle'), description: t('toast.notesSavedDescription')});
      
       const updatedAllNotesMeta = allNotesMeta
        .map(n => n.id === questionId ? {...n, notes: noteText, updatedAt: { toDate: () => new Date() } as Timestamp } : n)
        .sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime());
       setAllNotesMeta(updatedAllNotesMeta);
       fetchPageOfNotesWithQuestions(currentPage, updatedAllNotesMeta, language);

    } catch (e) {
      console.error("Error saving note:", e);
      toast({ title: t('toast.errorTitle'), description: t('toast.notesError'), variant: "destructive" });
    } finally {
      setIsSavingNote(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleDeleteNote = async () => {
    if (!firebaseUser || firebaseUser.isAnonymous || !noteIdToDelete) {
      toast({ title: t('toast.errorTitle'), description: "No note selected for deletion.", variant: "destructive" });
      setIsConfirmDeleteDialogOpen(false);
      setNoteIdToDelete(null);
      return;
    }
    setIsDeletingNote(noteIdToDelete);

    try {
      const noteDocRef = doc(db, "users", firebaseUser.uid, "questionNotes", noteIdToDelete);
      await deleteDoc(noteDocRef);
      toast({ title: t('toast.noteDeletedTitle'), description: t('toast.noteDeletedDescription') });

      const updatedAllNotesMeta = allNotesMeta.filter(n => n.id !== noteIdToDelete);
      setAllNotesMeta(updatedAllNotesMeta);
      
      const newTotalPages = Math.ceil(updatedAllNotesMeta.length / NOTES_PER_PAGE);
      let newCurrentPage = currentPage;
      if (currentPage > newTotalPages && newTotalPages > 0) {
        newCurrentPage = newTotalPages;
        setCurrentPage(newCurrentPage);
      } else if (updatedAllNotesMeta.length > 0) {
        fetchPageOfNotesWithQuestions(newCurrentPage, updatedAllNotesMeta, language);
      } else {
        setCurrentPage(1);
        setDisplayedNotes([]);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: t('toast.errorTitle'), description: "Failed to delete note.", variant: "destructive" });
    } finally {
      setIsDeletingNote(null);
      setIsConfirmDeleteDialogOpen(false);
      setNoteIdToDelete(null);
    }
  };

  const openDeleteConfirmDialog = (id: string) => {
    setNoteIdToDelete(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleNextPage = () => {
    if ((currentPage * NOTES_PER_PAGE) < allNotesMeta.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getCorrectAnswerText = (question: Question | null): string => {
    if (!question || !question.options || !question.correctAnswerId) return t('myNotesPage.noCorrectAnswer');
    const correctOption = question.options.find(opt => opt.id === question.correctAnswerId);
    return correctOption ? correctOption.text : t('myNotesPage.noCorrectAnswer');
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 animate-pulse text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading.auth')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-3 mb-4">
          <NotebookText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('myNotesPage.title')}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{t('myNotesPage.description')}</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error.title')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!firebaseUser || firebaseUser.isAnonymous ? (
          <Alert variant="default" className="shadow">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('auth.loginRequiredTitle')}</AlertTitle>
            <AlertDescription>
              {t('auth.loginRequiredMessageNotes')}
              <Button variant="link" asChild className="p-0 h-auto"><Link href="/auth/login">{t('userNav.logIn')}</Link></Button>
              {t('auth.loginRequiredMessageNotesAfterLink')}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
           <div className="text-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t('loading.notes')}</p>
          </div>
        ) : allNotesMeta.length === 0 ? (
          <Alert variant="default" className="shadow">
            <NotebookText className="h-4 w-4" />
            <AlertTitle>{t('myNotesPage.noNotesTitle')}</AlertTitle>
            <AlertDescription>{t('myNotesPage.noNotesDescription')}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-6">
              {displayedNotes.map(({ note, question }) => (
                <Card key={note.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {question ? (
                        <Link href={`/questions/${question.id}`} className="hover:underline text-primary">
                          {question.stem}
                        </Link>
                      ) : (
                        t('myNotesPage.questionDetailMissing')
                      )}
                    </CardTitle>
                    {question && (
                      <p className="text-sm text-muted-foreground">
                        {t('myNotesPage.correctAnswerLabel')}: <span className="font-semibold">{getCorrectAnswerText(question)}</span>
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={editableNotes[note.id] || ""}
                      onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                      placeholder={t('myNotesPage.editNotePlaceholder')}
                      rows={3}
                      className="mb-2 shadow-inner"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                     <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDeleteConfirmDialog(note.id)}
                        disabled={isDeletingNote === note.id || isSavingNote[note.id]}
                        aria-label={t('myNotesPage.deleteNoteButtonAria')}
                      >
                        {isDeletingNote === note.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        {t('myNotesPage.deleteNoteButton')}
                      </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveNote(note.id)}
                      disabled={isSavingNote[note.id] || isDeletingNote === note.id}
                      aria-label={t('myNotesPage.saveNoteButtonAria')}
                    >
                      {isSavingNote[note.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" /> {t('myNotesPage.saveNoteButton')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {allNotesMeta.length > NOTES_PER_PAGE && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <Button 
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('pagination.page')} {currentPage} {t('pagination.of')} {Math.ceil(allNotesMeta.length / NOTES_PER_PAGE)}
                </span>
                <Button 
                  onClick={handleNextPage} 
                  disabled={(currentPage * NOTES_PER_PAGE) >= allNotesMeta.length || isLoading}
                  variant="outline"
                >
                  {t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myNotesPage.deleteConfirmDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myNotesPage.deleteConfirmDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsConfirmDeleteDialogOpen(false); setNoteIdToDelete(null); }}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('myNotesPage.deleteConfirmDialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
