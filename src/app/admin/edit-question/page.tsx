"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { getQuestionById, updateQuestion, deleteQuestionById } from '@/actions/question-actions';
import { getSubcategoriesAction, registerSubcategoryAction } from '@/actions/subcategory-actions';
import { findScientificArticleAction } from '@/actions/enrichment-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MENU_DATA } from '@/lib/question-counts';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
import { Loader2, ArrowLeft, Save, Trash2, PlusCircle, Wand2, Search, Tag, CheckCircle2, FileEdit, FileText, Lightbulb, Sparkles, ExternalLink, ExternalLinkIcon, Eraser } from 'lucide-react';
import { ArticleReferenceDisplay } from '@/components/article-reference-display';
import { stripCitationsFromText } from '@/lib/citations';
import type { Question } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const localeSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  explanation: z.string().optional(),
  options: z.array(z.object({ text: z.string().min(1, "Option text is required") })).min(1, "At least one option is required")
});
const optionalLocaleSchema = z.object({
  questionText: z.string(),
  explanation: z.string().optional(),
  options: z.array(z.object({ text: z.string() }))
}).optional();

const questionFormSchema = z.object({
  topic: z.string().min(1, "Category is required"),
  subtopic: z.string().optional(),
  newSubcategory: z.string().optional(),
  difficulty: z.string().min(1, "Difficulty is required"),
  correctAnswerIndex: z.number().min(0, "Correct answer selection is required"),
  translations: z.object({
    en: localeSchema,
    es: optionalLocaleSchema,
    de: optionalLocaleSchema
  }),
  scientificArticle: z.object({
    article_reference: z.string().optional().nullable()
  }).optional()
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

function EditQuestionPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const questionId = searchParams.get('id');

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFindingArticle, setIsFindingArticle] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const closeAfterSaveRef = useRef(false);
  const [aiLog, setAiLog] = useState<{ type: 'info' | 'success' | 'warning' | 'error'; text: string }[]>([]);

  // Dynamic subcategories fetched from Firestore
  const [dynamicSubcats, setDynamicSubcats] = useState<string[]>([]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      topic: '',
      subtopic: '',
      newSubcategory: '',
      difficulty: 'Easy',
      correctAnswerIndex: 0,
      translations: {
        en: { questionText: '', explanation: '', options: [] },
        es: { questionText: '', explanation: '', options: [] },
        de: { questionText: '', explanation: '', options: [] }
      },
      scientificArticle: { article_reference: '' }
    }
  });

  const { fields: enOptions, append: appendEnOption, remove: removeEnOption } = useFieldArray({
    control: form.control,
    name: "translations.en.options"
  });
  const { append: appendEsOption, remove: removeEsOption, replace: replaceEsOptions } = useFieldArray({
    control: form.control,
    name: "translations.es.options"
  });
  const { append: appendDeOption, remove: removeDeOption, replace: replaceDeOptions } = useFieldArray({
    control: form.control,
    name: "translations.de.options"
  });

  const appendOptionAllLocales = () => {
    appendEnOption({ text: '' });
    appendEsOption({ text: '' });
    appendDeOption({ text: '' });
  };

  const removeOptionAllLocales = (index: number) => {
    const currentCorrect = form.getValues('correctAnswerIndex');
    removeEnOption(index);
    removeEsOption(index);
    removeDeOption(index);
    if (currentCorrect === index) form.setValue('correctAnswerIndex', 0);
    else if (currentCorrect > index) form.setValue('correctAnswerIndex', currentCorrect - 1);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        setCurrentUser(user);
      } else {
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  /** Fetch custom subcategories from Firestore for the given main category */
  const fetchDynamicSubcats = useCallback(async (mainCategory: string) => {
    if (!mainCategory || !currentUser?.uid) {
      if (!mainCategory) setDynamicSubcats([]);
      return;
    }
    const result = await getSubcategoriesAction(mainCategory, currentUser.uid);
    if (result.success && result.subcats) {
      setDynamicSubcats(result.subcats);
    } else {
      setDynamicSubcats([]);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (questionId && !isAuthLoading && isAdmin && currentUser) {
      loadQuestionData(questionId);
    }
  }, [questionId, isAuthLoading, isAdmin, currentUser]);

  const loadedQuestionRef = useRef<Question | null>(null);

  const loadQuestionData = async (id: string) => {
    setIsLoading(true);
    const result = await getQuestionById(id);
    if (result.success && result.question) {
      const q = result.question;
      loadedQuestionRef.current = q;
      const mainCat = q.main_localization || q.topic || 'Head';
      const raw = q as Record<string, unknown>;
      const tr = (raw.translations ?? {}) as Record<string, { questionText?: string; explanation?: string; options?: Array<{ text?: string } | string> }>;
      const getLocale = (locale: string) => tr[locale] ?? tr[locale.toUpperCase()] ?? tr[locale.toLowerCase()];
      const normOpt = (o: { text?: string } | string): { text: string } => (typeof o === 'string' ? { text: o } : { text: (o?.text ?? '') as string });
      const enOpts = (q.translations.en.options ?? []).map(normOpt);
      const enLen = enOpts.length;
      const pad = (opts: { text: string }[]) => {
        const out = opts.slice(0, enLen).map(o => ({ text: o.text ?? '' }));
        while (out.length < enLen) out.push({ text: '' });
        return out;
      };
      const esLocale = getLocale('es');
      const deLocale = getLocale('de');
      const esOpts = pad((esLocale?.options ?? []).map(normOpt));
      const deOpts = pad((deLocale?.options ?? []).map(normOpt));
      const esData = {
        questionText: (esLocale?.questionText ?? '') as string,
        explanation: (esLocale?.explanation ?? '') as string,
        options: esOpts
      };
      const deData = {
        questionText: (deLocale?.questionText ?? '') as string,
        explanation: (deLocale?.explanation ?? '') as string,
        options: deOpts
      };
      form.reset({
        topic: mainCat,
        subtopic: q.sub_main_location || q.subtopic || '',
        newSubcategory: '',
        difficulty: (q.difficulty === 'Easy' || q.difficulty === 'Advanced' ? q.difficulty : 'Easy'),
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        translations: {
          en: {
            questionText: q.translations.en.questionText,
            explanation: q.translations.en.explanation || '',
            options: enOpts
          },
          es: esData,
          de: deData
        },
        scientificArticle: { article_reference: q.scientificArticle?.article_reference ?? '' }
      });
      // Force each path so FormField/Controller pick up es and de
      form.setValue('translations.es.questionText', esData.questionText);
      form.setValue('translations.es.explanation', esData.explanation);
      replaceEsOptions(esData.options);
      form.setValue('translations.de.questionText', deData.questionText);
      form.setValue('translations.de.explanation', deData.explanation);
      replaceDeOptions(deData.options);
      await fetchDynamicSubcats(mainCat);
    } else {
      toast({ title: "Error", description: result.error || "Failed to load question", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const onSubmit = async (data: QuestionFormValues) => {
    if (!questionId) return;
    setIsSaving(true);

    const finalSubcategory =
      data.newSubcategory && data.newSubcategory.trim() !== ''
        ? data.newSubcategory.trim()
        : data.subtopic;

    // If a new subcategory was typed, register it in Firestore first
    if (data.newSubcategory && data.newSubcategory.trim() !== '' && currentUser?.uid) {
      const regResult = await registerSubcategoryAction(data.topic, data.newSubcategory.trim(), currentUser.uid);
      if (!regResult.success) {
        toast({
          title: "Warning",
          description: `Subcategory saved to question, but could not register it globally: ${regResult.error}`,
          variant: "destructive"
        });
      } else {
        // Refresh dynamic subcats to include the new one
        await fetchDynamicSubcats(data.topic);
      }
    }

    const updateData = {
      main_localization: data.topic,
      sub_main_location: finalSubcategory,
      difficulty: data.difficulty,
      correctAnswerIndex: data.correctAnswerIndex,
      translations: {
        en: data.translations.en,
        ...(data.translations.es && { es: data.translations.es }),
        ...(data.translations.de && { de: data.translations.de })
      },
      scientificArticle: data.scientificArticle
    };

    if (!currentUser?.uid) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    const result = await updateQuestion(questionId, updateData as any, currentUser.uid);

    if (result.success) {
      // Clear new subcategory field after successful save
      form.setValue('newSubcategory', '');
      // Set the subtopic to the new one so badge updates
      if (finalSubcategory) form.setValue('subtopic', finalSubcategory);
      toast({ title: "Success", description: "Question updated successfully", variant: "success" });
      if (closeAfterSaveRef.current) {
        closeAfterSaveRef.current = false;
        router.push('/admin/dashboard');
      }
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!questionId || !currentUser?.uid) return;
    const result = await deleteQuestionById(questionId, currentUser.uid);
    if (result.success) {
      toast({ title: "Deleted", description: "Question removed." });
      router.push('/admin/dashboard');
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  /** Extract 2–3 relevant terms from question and correct answer for a manual Google search. */
  const getSearchTermsFromQuestion = (questionText: string, correctAnswerText: string, maxTerms = 3): string[] => {
    const stopwords = new Set(['the', 'and', 'for', 'with', 'from', 'are', 'what', 'which', 'this', 'that', 'when', 'about', 'most', 'more', 'can', 'may', 'not', 'you', 'your', 'is', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'as', 'by', 'or', 'be', 'it', 'if', 'into', 'have', 'has', 'been', 'would', 'could', 'should', 'will', 'each', 'their', 'there', 'than', 'then']);
    const text = `${questionText} ${correctAnswerText}`.replace(/[^\w\s'-]/g, ' ').toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length >= 3 && !stopwords.has(w));
    const seen = new Set<string>();
    const terms: string[] = [];
    for (const w of words) {
      if (terms.length >= maxTerms) break;
      const key = w.replace(/'/g, '');
      if (!seen.has(key)) { seen.add(key); terms.push(w); }
    }
    return terms;
  };

  const handleManualSearch = () => {
    const values = form.getValues();
    const articleRef = values.scientificArticle?.article_reference?.trim() || '';
    const query = articleRef || (() => {
      const questionText = values.translations.en?.questionText?.trim() || '';
      const correctIdx = values.correctAnswerIndex;
      const correctOpt = values.translations.en?.options?.[correctIdx];
      const correctAnswerText = correctOpt?.text?.trim() || '';
      const terms = getSearchTermsFromQuestion(questionText, correctAnswerText, 3);
      return terms.length > 0 ? `scientific article ${terms.join(' ')}` : 'scientific article';
    })();
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /** Build HTML string with URLs and DOIs as clickable links. Trailing punctuation is stripped from DOIs so the link resolves. */
  const linkifyRef = (text: string): string => {
    if (!text?.trim()) return '';
    const trimPunc = (s: string) => s.replace(/[.,;:]+$/, '');
    return text
      .replace(/https?:\/\/[^\s)]+/gi, (url) => {
        const href = trimPunc(url);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${url}</a>`;
      })
      .replace(/(10\.\d{4,}\/[^\s)]+)/gi, (doi) => {
        const clean = doi.replace(/[.,;:]+$/, '');
        return `<a href="https://doi.org/${clean}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${doi}</a>`;
      });
  };

  const handleOpenQuestionInNewWindow = () => {
    const values = form.getValues();
    const questionText = values.translations.en?.questionText?.trim() || '';
    const options = values.translations.en?.options?.map((o) => o.text?.trim() || '') ?? [];
    const refText = values.scientificArticle?.article_reference?.trim() || '';
    const refHtml = linkifyRef(refText);
    const optionsHtml = options.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      return `<label style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;cursor:pointer;"><input type="radio" name="answer" value="${i}" /> <span>${letter}. ${escapeHtml(opt)}</span></label>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Question</title></head><body style="font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;padding:16px;line-height:1.6;">
<h1 style="font-size:1.25rem;margin-bottom:16px;">Question</h1>
<p style="white-space:pre-wrap;margin-bottom:24px;">${escapeHtml(questionText)}</p>
<div style="margin-bottom:24px;">
${optionsHtml}
</div>
${refText ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;"><strong>Reference</strong><p style="font-size:0.875rem;margin-top:8px;">${refHtml}</p></div>` : ''}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const handleFindArticle = async () => {
    const values = form.getValues();
    setIsFindingArticle(true);
    setAiLog([{ type: 'info', text: 'Searching medical literature...' }]);

    const correctIdx = values.correctAnswerIndex;
    const correctOpt = values.translations.en.options[correctIdx];

    if (!correctOpt?.text) {
      setAiLog([{ type: 'error', text: 'Please mark a correct answer before searching.' }]);
      setIsFindingArticle(false);
      return;
    }

    if (!currentUser?.uid) return;
    const result = await findScientificArticleAction({
      questionStem: values.translations.en.questionText,
      options: values.translations.en.options.map(o => o.text),
      correctAnswer: correctOpt.text
    }, currentUser.uid);

    if (!result.success) {
      setAiLog([{ type: 'error', text: `Error: ${result.error ?? 'Unknown error from AI.'}` }]);
      setIsFindingArticle(false);
      return;
    }

    const data = result.data!;
    const logs: { type: 'info' | 'success' | 'warning' | 'error'; text: string }[] = [];

    if (data.pubmed_query) {
      logs.push({ type: 'info', text: `PubMed query: ${data.pubmed_query}` });
    }
    if (Array.isArray(data.original_concepts) && data.original_concepts.length > 0) {
      logs.push({ type: 'info', text: `Concepts: ${data.original_concepts.join(', ')}` });
    }
    if (Array.isArray(data.evidence_sources) && data.evidence_sources.length > 0) {
      logs.push({ type: 'info', text: `Evidence sources: ${data.evidence_sources.join(', ')}` });
    }

    if (data.isValid) {
      if (data.search_returned_zero_results) {
        logs.push({ type: 'warning', text: 'No high-impact evidence found in the last 15 years that validates this answer. Query ran but PubMed returned no articles.' });
      }
      // Fill the article reference field
      if (data.articleTitle && data.articleUrl) {
        form.setValue('scientificArticle.article_reference', `${data.articleTitle}. Available at: ${data.articleUrl}`);
        logs.push({ type: 'success', text: `✓ Source found: ${data.articleTitle}` });
        logs.push({ type: 'success', text: `  URL: ${data.articleUrl}` });
      } else if (!data.search_returned_zero_results) {
        logs.push({ type: 'success', text: '✓ Answer validated but no specific article URL returned.' });
      }
      if (data.snippet) {
        logs.push({ type: 'info', text: `Snippet: "${data.snippet}"` });
      }
      if (data.reasoning) {
        logs.push({ type: 'info', text: `Reasoning: ${data.reasoning}` });
      }
    } else {
      logs.push({ type: 'warning', text: '⚠ AI flagged the marked answer as potentially incorrect.' });
      if (data.reasoning) {
        logs.push({ type: 'warning', text: `Reason: ${data.reasoning}` });
      }
      if (data.validated_correct_answer) {
        logs.push({ type: 'error', text: `AI-suggested correct answer: "${data.validated_correct_answer}"` });
      }
    }

    setAiLog(logs);
    setIsFindingArticle(false);
  };

  const handleRemoveCitations = () => {
    const values = form.getValues();
    const enQ = values.translations.en?.questionText || '';
    const enExp = values.translations.en?.explanation || '';
    const enOpts = values.translations.en?.options ?? [];
    const strippedEn = {
      questionText: stripCitationsFromText(enQ),
      explanation: stripCitationsFromText(enExp),
      options: enOpts.map((opt: { text: string }) => ({ ...opt, text: stripCitationsFromText(opt.text || '') })),
    };
    form.setValue('translations.en.questionText', strippedEn.questionText);
    form.setValue('translations.en.explanation', strippedEn.explanation);
    strippedEn.options.forEach((opt: { text: string }, i: number) => {
      form.setValue(`translations.en.options.${i}.text`, opt.text);
    });

    const translations: Record<string, { questionText: string; explanation: string; options: { id?: string; text: string }[] }> = { en: strippedEn };
    const esForm = values.translations?.es;
    if (esForm) {
      translations.es = {
        questionText: stripCitationsFromText(esForm.questionText ?? ''),
        explanation: stripCitationsFromText(esForm.explanation ?? ''),
        options: (esForm.options ?? []).map((o) => ({ ...o, text: stripCitationsFromText(o.text ?? '') })),
      };
    }
    const deForm = values.translations?.de;
    if (deForm) {
      translations.de = {
        questionText: stripCitationsFromText(deForm.questionText ?? ''),
        explanation: stripCitationsFromText(deForm.explanation ?? ''),
        options: (deForm.options ?? []).map((o) => ({ ...o, text: stripCitationsFromText(o.text ?? '') })),
      };
    }

    if (currentUser?.uid && questionId) {
      updateQuestion(questionId, { translations } as Partial<Question>, currentUser.uid).then((res) => {
        if (res.success && loadedQuestionRef.current) {
          loadedQuestionRef.current = { ...loadedQuestionRef.current, translations };
        }
      });
      if (translations.es) {
        form.setValue('translations.es.questionText', translations.es.questionText);
        form.setValue('translations.es.explanation', translations.es.explanation);
        translations.es.options.forEach((opt, i) => form.setValue(`translations.es.options.${i}.text`, opt.text));
      }
      if (translations.de) {
        form.setValue('translations.de.questionText', translations.de.questionText);
        form.setValue('translations.de.explanation', translations.de.explanation);
        translations.de.options.forEach((opt, i) => form.setValue(`translations.de.options.${i}.text`, opt.text));
      }
    }
    toast({ title: t('admin.editQuestion.removeCitationsButton'), description: 'Citations removed from question, options, and explanation (all languages).', variant: 'default' });
  };

  /** Build the merged list of subcategories: static + dynamic (deduped), sorted A-Z in English locale */
  const getMergedSubcats = (mainCategory: string): { name: string; isDynamic: boolean }[] => {
    const staticKeys = mainCategory && MENU_DATA.sub_main_location[mainCategory]
      ? Object.keys(MENU_DATA.sub_main_location[mainCategory])
      : [];
    const staticSet = new Set(staticKeys);
    const dynamicOnly = dynamicSubcats.filter(s => !staticSet.has(s));
    const merged = [
      ...staticKeys.map(name => ({ name, isDynamic: false })),
      ...dynamicOnly.map(name => ({ name, isDynamic: true })),
    ];
    return merged.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  };

  if (isAuthLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!isAdmin && currentUser) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Admin privileges required.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }
  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      {!questionId ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Find Question to Edit</CardTitle>
            <CardDescription>Enter the question ID manually to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input id="q-search" placeholder="Enter ID (e.g. HEAD_VASC_...)" />
              <Button onClick={() => {
                const val = (document.getElementById('q-search') as HTMLInputElement).value;
                if (val) router.push(`/admin/edit-question?id=${val}`);
              }}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="bg-muted/30">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileEdit className="h-6 w-6 text-primary" />
                    Verify Content
                  </CardTitle>
                  <CardDescription className="font-mono mt-1">ID: {questionId}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <Tag className="h-3 w-3" />
                    {form.watch('topic')}
                  </Badge>
                  {form.watch('subtopic') && (
                    <Badge variant="outline" className="px-3 py-1">
                      {form.watch('subtopic')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="topic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Category</FormLabel>
                      <Select
                        onValueChange={async (val) => {
                          field.onChange(val);
                          form.setValue('subtopic', '');
                          await fetchDynamicSubcats(val);
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(['Head', 'Neck', 'Spine', 'General'] as const).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="subtopic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!form.watch('topic')}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getMergedSubcats(form.watch('topic')).length > 0 ? (
                            getMergedSubcats(form.watch('topic')).map(({ name, isDynamic }) => (
                              <SelectItem key={name} value={name}>
                                <span className="flex items-center gap-2">
                                  {name}
                                  {isDynamic && (
                                    <span className="text-[10px] text-primary font-semibold bg-primary/10 rounded px-1">NEW</span>
                                  )}
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No Predefined Subcategories</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="newSubcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Subcategory (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Type a custom subcategory..." />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        If filled, this creates a new subcategory for the question and adds it to the list.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="difficulty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveCitations}>
                    <Eraser className="mr-2 h-4 w-4" />
                    {t('admin.editQuestion.removeCitationsButton')}
                  </Button>
                </div>

                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="es">Español</TabsTrigger>
                    <TabsTrigger value="de">Deutsch</TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="space-y-4 mt-4">
                    <FormField control={form.control} name="translations.en.questionText" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">Question Text (English)</FormLabel>
                        <Textarea {...field} rows={5} className="text-md leading-relaxed" />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Answer Options</Label>
                      <Card className="border-dashed bg-muted/10">
                        <CardContent className="pt-6 space-y-4">
                          {enOptions.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-center group">
                              <span className="font-bold text-muted-foreground w-6">{String.fromCharCode(65 + index)}.</span>
                              <Input
                                {...form.register(`translations.en.options.${index}.text` as const)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant={form.watch('correctAnswerIndex') === index ? "default" : "outline"}
                                size="sm"
                                className={form.watch('correctAnswerIndex') === index ? "bg-primary text-primary-foreground min-w-[100px]" : "min-w-[100px] group-hover:border-primary/50"}
                                onClick={() => form.setValue('correctAnswerIndex', index)}
                              >
                                {form.watch('correctAnswerIndex') === index ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Correct</> : "Mark Correct"}
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionAllLocales(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={appendOptionAllLocales}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Option (all languages)
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    <FormField control={form.control} name="translations.en.explanation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Explanation (English)
                        </FormLabel>
                        <Textarea {...field} rows={4} value={field.value || ''} placeholder="Provide a detailed explanation..." />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>

                  <TabsContent value="es" className="space-y-4 mt-4">
                    <FormField control={form.control} name="translations.es.questionText" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">Texto de la pregunta (Español)</FormLabel>
                        <Textarea {...field} value={form.watch('translations.es.questionText') ?? field.value ?? ''} rows={5} className="text-md leading-relaxed" />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Opciones de respuesta</Label>
                      <Card className="border-dashed bg-muted/10">
                        <CardContent className="pt-6 space-y-4">
                          {enOptions.map((field, index) => (
                            <div key={`es-${field.id}-${index}`} className="flex gap-3 items-center group">
                              <span className="font-bold text-muted-foreground w-6">{String.fromCharCode(65 + index)}.</span>
                              <Input
                                {...form.register(`translations.es.options.${index}.text` as const)}
                                placeholder={`Opción ${index + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant={form.watch('correctAnswerIndex') === index ? "default" : "outline"}
                                size="sm"
                                className={form.watch('correctAnswerIndex') === index ? "bg-primary text-primary-foreground min-w-[100px]" : "min-w-[100px] group-hover:border-primary/50"}
                                onClick={() => form.setValue('correctAnswerIndex', index)}
                              >
                                {form.watch('correctAnswerIndex') === index ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Correcta</> : "Marcar correcta"}
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionAllLocales(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                    <FormField control={form.control} name="translations.es.explanation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Explicación (Español)
                        </FormLabel>
                        <Textarea {...field} value={form.watch('translations.es.explanation') ?? field.value ?? ''} rows={4} placeholder="Explicación detallada..." />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>

                  <TabsContent value="de" className="space-y-4 mt-4">
                    <FormField control={form.control} name="translations.de.questionText" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">Fragentext (Deutsch)</FormLabel>
                        <Textarea {...field} value={form.watch('translations.de.questionText') ?? field.value ?? ''} rows={5} className="text-md leading-relaxed" />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Antwortoptionen</Label>
                      <Card className="border-dashed bg-muted/10">
                        <CardContent className="pt-6 space-y-4">
                          {enOptions.map((field, index) => (
                            <div key={`de-${field.id}-${index}`} className="flex gap-3 items-center group">
                              <span className="font-bold text-muted-foreground w-6">{String.fromCharCode(65 + index)}.</span>
                              <Input
                                {...form.register(`translations.de.options.${index}.text` as const)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant={form.watch('correctAnswerIndex') === index ? "default" : "outline"}
                                size="sm"
                                className={form.watch('correctAnswerIndex') === index ? "bg-primary text-primary-foreground min-w-[100px]" : "min-w-[100px] group-hover:border-primary/50"}
                                onClick={() => form.setValue('correctAnswerIndex', index)}
                              >
                                {form.watch('correctAnswerIndex') === index ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Richtig</> : "Als richtig"}
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionAllLocales(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                    <FormField control={form.control} name="translations.de.explanation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Erklärung (Deutsch)
                        </FormLabel>
                        <Textarea {...field} value={form.watch('translations.de.explanation') ?? field.value ?? ''} rows={4} placeholder="Detaillierte Erklärung..." />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>
                </Tabs>

                <Card className="border-primary/20 bg-muted/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Show Question
                    </CardTitle>
                    <CardDescription>Preview as the question will appear for answering.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Question</Label>
                      <p className="mt-1 text-base whitespace-pre-wrap">{form.watch('translations.en.questionText') || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Options</Label>
                      <ul className="mt-2 space-y-2 list-none">
                        {(form.watch('translations.en.options') ?? []).map((opt, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="font-medium text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
                            <span>{opt.text || '—'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {form.watch('scientificArticle.article_reference') && (
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Reference (APA 7 style; links clickable)</Label>
                        <div className="mt-2">
                          <ArticleReferenceDisplay
                            articleReference={form.watch('scientificArticle.article_reference')}
                            doi={undefined}
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleOpenQuestionInNewWindow}
                    >
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      Open in new window
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      AI Reference Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="scientificArticle.article_reference" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article Reference (AMA Style)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} placeholder="Author et al. Title. Journal. Year..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={handleFindArticle}
                        disabled={isFindingArticle}
                      >
                        {isFindingArticle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Find Source with AI
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleManualSearch}
                        disabled={isFindingArticle}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Search manually
                      </Button>
                    </div>
                    {aiLog.length > 0 && (
                      <div className="text-xs font-mono bg-black/10 dark:bg-white/10 p-3 rounded max-h-40 overflow-y-auto space-y-1">
                        {aiLog.map((log, i) => (
                          <div
                            key={i}
                            className={
                              log.type === 'success' ? 'text-green-400' :
                                log.type === 'warning' ? 'text-yellow-400' :
                                  log.type === 'error' ? 'text-red-400' :
                                    'text-muted-foreground'
                            }
                          >
                            {log.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/30 p-6">
                <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Question
                </Button>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => {
                      closeAfterSaveRef.current = true;
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save and Close
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EditQuestionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <EditQuestionPageContent />
    </Suspense>
  );
}
