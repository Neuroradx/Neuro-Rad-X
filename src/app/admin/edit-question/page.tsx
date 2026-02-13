"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { getQuestionById, updateQuestion, deleteQuestionById } from '@/actions/question-actions';
import { findScientificArticleAction } from '@/actions/enrichment-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Loader2, ArrowLeft, Save, Trash2, PlusCircle, Wand2, Search, Tag, CheckCircle2, FileEdit, FileText, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const questionFormSchema = z.object({
  topic: z.string().min(1, "Category is required"),
  subtopic: z.string().optional(),
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
  const [aiLog, setAiLog] = useState<string[]>([]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      topic: '',
      subtopic: '',
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
      form.reset({
        topic: q.main_localization || q.topic || 'Head',
        subtopic: q.sub_main_location || q.subtopic || '',
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
    } else {
      toast({ title: "Error", description: result.error || "Failed to load question", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const onSubmit = async (data: QuestionFormValues) => {
    if (!questionId) return;
    setIsSaving(true);
    
    const updateData = {
      main_localization: data.topic,
      sub_main_location: data.subtopic,
      difficulty: data.difficulty,
      correctAnswerIndex: data.correctAnswerIndex,
      translations: {
        en: data.translations.en
      },
      scientificArticle: data.scientificArticle
    };

    const result = await updateQuestion(questionId, updateData as any);

    if (result.success) {
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
    setAiLog(prev => [...prev, "Starting AI search for scientific article..."]);
    
    const correctIdx = values.correctAnswerIndex;
    const correctOpt = values.translations.en.options[correctIdx];

    const result = await findScientificArticleAction({
      questionStem: values.translations.en.questionText,
      options: values.translations.en.options.map(o => o.text),
      correctAnswer: correctOpt?.text || ""
    });

    if (result.success && result.data?.isValid) {
      form.setValue('scientificArticle.article_reference', `${result.data.articleTitle}. Available at: ${result.data.articleUrl}`);
      setAiLog(prev => [...prev, `Found: ${result.data?.articleTitle}`]);
    } else {
      setAiLog(prev => [...prev, "AI could not find a specific match."]);
    }
    setIsFindingArticle(false);
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
                      <Input {...field} placeholder="e.g. Head" />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subtopic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Input {...field} value={field.value || ''} placeholder="e.g. Vascular" />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="difficulty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Input {...field} placeholder="Easy, Medium, or Advanced" />
                    <FormMessage />
                  </FormItem>
                )} />

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
                      <div className="text-xs font-mono bg-black/10 dark:bg-white/10 p-2 rounded max-h-24 overflow-y-auto">
                        {aiLog.map((log, i) => <div key={i}>{log}</div>)}
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
