'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { getTopicDisplayName, getSubtopicDisplayName } from '@/lib/formatting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, CheckCircle, FileText, Search, Loader2 } from 'lucide-react';
import { ArticleReferenceDisplay } from '@/components/article-reference-display';
import { ImageDisplay } from '@/components/questions/image-display';

interface DisplayQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  stem: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  explanation: string;
  imageUrl?: string;
  scientificArticle?: { article_reference?: string | null; doi?: string | null };
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const id = params?.id as string | undefined;

  const [question, setQuestion] = useState<DisplayQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecked(true);
      if (!user) {
        router.push('/auth/login');
        return;
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!id || !isAuthChecked) return;

    const fetchQuestion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docSnap = await getDoc(doc(db, 'questions', id));
        if (!docSnap.exists()) {
          setError(t('questionDetail.notFound', { defaultValue: 'Question not found.' }));
          setIsLoading(false);
          return;
        }

        const data = docSnap.data();
        const translations = data.translations || {};
        const langTranslations = translations[language] || translations.en || {};

        let options: { id: string; text: string }[] = [];
        if (langTranslations.options) {
          options = langTranslations.options.map((opt: { text: string }, index: number) => ({
            id: `${docSnap.id}-opt-${index}`,
            text: opt.text,
          }));
        }

        const correctAnswerId = options[data.correctAnswerIndex]?.id;

        setQuestion({
          id: docSnap.id,
          topic: getTopicDisplayName(data.main_localization ?? undefined, t),
          subtopic: data.sub_main_location ? getSubtopicDisplayName(data.sub_main_location, t) : undefined,
          difficulty: data.difficulty,
          stem: langTranslations.questionText || '',
          options,
          correctAnswerId: correctAnswerId || '',
          explanation: langTranslations.explanation || '',
          imageUrl: data.imageUrl,
          scientificArticle: data.scientificArticle,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('questionDetail.errorLoading', { defaultValue: 'Error loading question.' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id, language, isAuthChecked, t]);

  if (!isAuthChecked || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error.title', { defaultValue: 'Error' })}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back', { defaultValue: 'Back' })}
        </Button>
      </div>
    );
  }

  if (!question) return null;

  const difficultyText = t(`difficulty.${question.difficulty.toLowerCase()}` as any);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back', { defaultValue: 'Back' })}
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-xl">{question.topic}{question.subtopic ? `: ${question.subtopic}` : ''}</CardTitle>
              <CardDescription className="mt-1">
                {t('common.difficultyLabelWithColon', { difficulty: difficultyText })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {question.imageUrl && (
            <ImageDisplay
              src={question.imageUrl}
              alt={t('common.imageFor', { topic: question.topic })}
              dataAiHint={`${question.topic} diagnostic`}
              initialWidth={600}
              initialHeight={400}
            />
          )}
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{question.stem}</p>

          {question.options.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm text-muted-foreground">{t('questionDetail.optionsLabel', { defaultValue: 'Options' })}</p>
              <ul className="space-y-2">
                {question.options.map((opt) => (
                  <li
                    key={opt.id}
                    className={`p-4 rounded-md border ${
                      opt.id === question.correctAnswerId
                        ? 'border-green-500 bg-green-500/10 dark:bg-green-900/20'
                        : 'border-border'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.id === question.correctAnswerId && (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0" />
                      )}
                      {opt.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.explanation && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('studyMode.explanationTitle', { defaultValue: 'Explanation' })}</h3>
              <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {question.scientificArticle?.article_reference && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('common.sourceLabel', { defaultValue: 'Source' })}
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">{t('common.sourceLabel', { defaultValue: 'Source' })} (APA 7):</span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(question.scientificArticle.article_reference || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary p-1"
                  title={t('common.searchOnWeb', { defaultValue: 'Search on web' })}
                >
                  <Search className="h-4 w-4" />
                </a>
              </div>
              <ArticleReferenceDisplay
                articleReference={question.scientificArticle.article_reference}
                doi={question.scientificArticle.doi}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
