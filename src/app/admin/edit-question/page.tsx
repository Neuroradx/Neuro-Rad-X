"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Loader2, ArrowLeft, Save, Trash2, PlusCircle, Wand2, Search, Tag, CheckCircle2, FileEdit, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const questionFormSchema = z.object({
  topic: z.string().min(1, "Category is required"),
  subtopic: z.string().optional(),
  newSubcategory: z.string().optional(),
  difficulty: z.string().min(1, "Difficulty is required"),
  correctAnswerIndex: z.number().min(0, "Correct answer selection is required"),
  translations: z.object({
    en: z.object({
      questionText: z.string().min(1, "Question text is required"),
      explanation: z.string().optional(),
      options: z.array(z.object({
        text: z.string().min(1, "Option text is required")
      })).min(1, "At least one option is required")
    })
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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFindingArticle, setIsFindingArticle] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [aiLog, setAiLog] = useState<{ type: 'info' | 'success' | 'warning' | 'error'; text: string }[]>([]);

  // Dynamic subcategories fetched from Firestore
  const [dynamicSubcats, setDynamicSubcats] = useState<string[]>([]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      topic: '',
      subtopic: '',
      newSubcategory: '',
      difficulty: 'Medium',
      correctAnswerIndex: 0,
      translations: {
        en: {
          questionText: '',
          explanation: '',
          options: []
        }
      },
      scientificArticle: {
        article_reference: ''
      }
    }
  });

  const { fields: enOptions, append: appendEnOption, remove: removeEnOption } = useFieldArray({
    control: form.control,
    name: "translations.en.options"
  });

  /** Fetch custom subcategories from Firestore for the given main category */
  const fetchDynamicSubcats = useCallback(async (mainCategory: string) => {
    if (!mainCategory) {
      setDynamicSubcats([]);
      return;
    }
    const result = await getSubcategoriesAction(mainCategory);
    if (result.success && result.subcats) {
      setDynamicSubcats(result.subcats);
    } else {
      setDynamicSubcats([]);
    }
  }, []);

  useEffect(() => {
    if (questionId) {
      loadQuestionData(questionId);
    }
  }, [questionId]);

  const loadQuestionData = async (id: string) => {
    setIsLoading(true);
    const result = await getQuestionById(id);
    if (result.success && result.question) {
      const q = result.question;
      const mainCat = q.main_localization || q.topic || 'Head';
      form.reset({
        topic: mainCat,
        subtopic: q.sub_main_location || q.subtopic || '',
        newSubcategory: '',
        difficulty: q.difficulty || 'Medium',
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        translations: {
          en: {
            questionText: q.translations.en.questionText,
            explanation: q.translations.en.explanation || '',
            options: q.translations.en.options.map(o => ({ text: o.text }))
          }
        },
        scientificArticle: {
          article_reference: q.scientificArticle?.article_reference || ''
        }
      });
      // Fetch dynamic subcats for the loaded main category
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
    if (data.newSubcategory && data.newSubcategory.trim() !== '') {
      const regResult = await registerSubcategoryAction(data.topic, data.newSubcategory.trim());
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
        en: data.translations.en
      },
      scientificArticle: data.scientificArticle
    };

    const result = await updateQuestion(questionId, updateData as any);

    if (result.success) {
      // Clear new subcategory field after successful save
      form.setValue('newSubcategory', '');
      // Set the subtopic to the new one so badge updates
      if (finalSubcategory) form.setValue('subtopic', finalSubcategory);
      toast({ title: "Success", description: "Question updated successfully", variant: "success" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!questionId) return;
    const result = await deleteQuestionById(questionId);
    if (result.success) {
      toast({ title: "Deleted", description: "Question removed." });
      router.push('/admin/dashboard');
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

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

    const result = await findScientificArticleAction({
      questionStem: values.translations.en.questionText,
      options: values.translations.en.options.map(o => o.text),
      correctAnswer: correctOpt.text
    });

    if (!result.success) {
      setAiLog([{ type: 'error', text: `Error: ${result.error ?? 'Unknown error from AI.'}` }]);
      setIsFindingArticle(false);
      return;
    }

    const data = result.data!;
    const logs: { type: 'info' | 'success' | 'warning' | 'error'; text: string }[] = [];

    if (data.isValid) {
      // Fill the article reference field
      if (data.articleTitle && data.articleUrl) {
        form.setValue('scientificArticle.article_reference', `${data.articleTitle}. Available at: ${data.articleUrl}`);
        logs.push({ type: 'success', text: `✓ Source found: ${data.articleTitle}` });
        logs.push({ type: 'success', text: `  URL: ${data.articleUrl}` });
      } else {
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <FileEdit className="h-6 w-6 text-primary" />
                      Edit Question
                    </CardTitle>
                    <CardDescription className="font-mono mt-1">ID: {questionId}</CardDescription>
                  </div>
                  <Badge variant="default" className="bg-primary/10 text-primary uppercase text-xs">
                    {form.watch('difficulty')}
                  </Badge>
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
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

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
                            {form.watch('correctAnswerIndex') === index ? (
                              <><CheckCircle2 className="mr-2 h-4 w-4" /> Correct</>
                            ) : "Mark Correct"}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeEnOption(index)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => appendEnOption({ text: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Option
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <FormField control={form.control} name="translations.en.explanation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Explanation
                    </FormLabel>
                    <Textarea {...field} rows={4} value={field.value || ''} placeholder="Provide a detailed explanation..." />
                    <FormMessage />
                  </FormItem>
                )} />

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
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleFindArticle}
                      disabled={isFindingArticle}
                    >
                      {isFindingArticle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Find Source with AI
                    </Button>
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
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
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
