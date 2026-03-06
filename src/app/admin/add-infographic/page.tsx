'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Copy, Check, Sparkles, FileCode, Loader2, FilePlus2 } from 'lucide-react';
import { createInfographicFromCode } from '@/actions/create-infographic-action';
import { adaptInfographicCode } from '@/lib/adapt-infographic-code';

const GEMINI_PROMPT = `You are an expert React/Next.js developer. Generate a complete, production-ready React component for a neuroradiology infographic.

REQUIREMENTS:
- Next.js 15, TypeScript, Tailwind CSS, shadcn/ui components (Card, CardHeader, CardTitle, CardContent, CardDescription, Table).
- Use Recharts (PieChart, BarChart, etc.) for data visualization.
- The component must be a default export and start with 'use client'; at the top.

MANDATORY STRUCTURE (follow exactly):
1. Outer wrapper: <div className="infographic-layout space-y-8">
2. Header: <header className="infographic-header"> with:
   - <h1 className="infographic-title"> with <GradientText>highlighted words</GradientText> inside
   - <p className="infographic-subtitle">Brief description</p>
3. Main content: <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
4. Each section: <Card className="infographic-card md:col-span-2"> (or md:col-span-1 for half width)
5. Section title: <CardTitle className="flex items-center text-xl"><SectionIcon path="..." /> Title text</CardTitle>
6. Footer: <footer className="infographic-footer"><p>Summary or disclaimer</p></footer>

REQUIRED IMPORTS (use these exact paths):
- import { GradientText, SectionIcon, InfographicSection } from './infographic-shared';
- import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
- import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
- import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
- For charts: import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

CHART COLORS (critical - never use hex):
- Always use: color: 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', etc. (--chart-1 through --chart-5)
- Chart config format: { keyName: { label: 'Label', color: 'hsl(var(--chart-1))' } }
- In Pie/Bar: use fill={\`var(--color-\${entry.key})\`} for Cell components

SECTION ICONS:
- Use Heroicons path format. Example paths:
  - List: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
  - Star: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
  - Book: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"

ALTERNATIVE: Use InfographicSection for simpler sections:
<InfographicSection iconPath="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" title="1. Introduction" span={2}>
  <p className="text-base text-muted-foreground">Content here.</p>
</InfographicSection>

SCIENTIFIC REFERENCES (mandatory - you MUST search for these):
- Before generating the code, search for exactly 10 real peer-reviewed scientific articles relevant to the topic. Use your knowledge of medical literature, PubMed, and academic sources.
- Do NOT invent or fabricate references. Every reference must be a real, verifiable publication.
- Format each of the 10 references in APA 7th edition style.
- Display them in the footer in a "References" or "Sources" section, as a numbered list (1–10).
- APA 7 journal article: Author, A. A., & Author, B. B. (Year). Title of article. Journal Name, Volume(Issue), pages. https://doi.org/xxx
- APA 7 book/chapter: Author, A. A. (Year). Title of work. Publisher. https://...

Generate the full component code for this topic: [INSERT YOUR TOPIC HERE]

Include realistic medical/neuroradiology data, charts where appropriate, and a footer with exactly 10 scientific references in APA 7 format. Output ONLY the React code, no markdown fences.`;

// Uses adaptInfographicCode from lib - applies full style/structure/color adaptation

const CATEGORIES = [
  { value: 'vascular', label: 'Vascular' },
  { value: 'microangiopathy', label: 'Microangiopathy' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'inflammatory_infectious_toxic', label: 'Inflammatory / Infectious / Toxic' },
  { value: 'general_technique', label: 'General / Technique' },
  { value: 'other', label: 'Other' },
] as const;

export default function AddInfographicPage() {
  const { t } = useTranslation();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [pastedCode, setPastedCode] = useState('');
  const [adaptedCode, setAdaptedCode] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('vascular');
  const [isCreating, setIsCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; message?: string; error?: string; filePath?: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUserUid(user?.uid ?? null));
    return () => unsub();
  }, []);

  const handleAnalyze = () => {
    const result = adaptInfographicCode(pastedCode);
    setAdaptedCode(result);
  };

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleCreate = async () => {
    if (!userUid || !adaptedCode.trim() || !componentName.trim() || !title.trim()) return;
    setIsCreating(true);
    setCreateResult(null);
    const result = await createInfographicFromCode(userUid, {
      code: adaptedCode,
      componentName: componentName.trim(),
      title: title.trim(),
      categoryId,
    });
    setIsCreating(false);
    setCreateResult(
      result.success
        ? { success: true, message: result.message, filePath: result.filePath }
        : { success: false, error: result.error }
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6" aria-label={t('admin.backToAdminDashboard')}>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('admin.backToAdminDashboard')}
        </Link>
      </Button>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            {t('admin.addInfographic.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('admin.addInfographic.description')}
          </p>
        </div>

        {/* Step 1: Gemini Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              {t('admin.addInfographic.step1Title')}
            </CardTitle>
            <CardDescription>
              {t('admin.addInfographic.step1Description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>{t('admin.addInfographic.step1Item1')}</li>
              <li>{t('admin.addInfographic.step1Item2')}</li>
              <li>{t('admin.addInfographic.step1Item3')}</li>
              <li>{t('admin.addInfographic.step1Item4')}</li>
            </ol>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted/50 text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono">
                {GEMINI_PROMPT}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(GEMINI_PROMPT, setCopiedPrompt)}
              >
                {copiedPrompt ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copiedPrompt ? t('admin.addInfographic.copied') : t('admin.addInfographic.copyPrompt')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Paste & Adapt */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.addInfographic.step2Title')}</CardTitle>
            <CardDescription>
              {t('admin.addInfographic.step2Description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('admin.addInfographic.pastePlaceholder')}
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <Button onClick={handleAnalyze} disabled={!pastedCode.trim()}>
              {t('admin.addInfographic.analyzeButton')}
            </Button>

            {adaptedCode && (
              <div className="space-y-2">
                <h3 className="font-semibold">{t('admin.addInfographic.adaptedOutput')}</h3>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted/50 text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono">
                    {adaptedCode}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(adaptedCode, setCopiedCode)}
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copiedCode ? t('admin.addInfographic.copied') : t('admin.addInfographic.copyCode')}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('admin.addInfographic.adaptedHint')}
                </p>

                {/* Create & Integrate */}
                <div className="mt-6 pt-6 border-t border-border/60 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FilePlus2 className="h-5 w-5 text-primary" />
                    {t('admin.addInfographic.createTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('admin.addInfographic.createDescription')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="componentName">{t('admin.addInfographic.componentNameLabel')}</Label>
                      <Input
                        id="componentName"
                        placeholder={t('admin.addInfographic.componentNamePlaceholder')}
                        value={componentName}
                        onChange={(e) => setComponentName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">{t('admin.addInfographic.titleLabel')}</Label>
                      <Input
                        id="title"
                        placeholder={t('admin.addInfographic.titlePlaceholder')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('admin.addInfographic.categoryLabel')}</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {createResult && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        createResult.success
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {createResult.success ? createResult.message : createResult.error}
                      {createResult.success && createResult.filePath && (
                        <p className="mt-1 font-mono text-xs">{createResult.filePath}</p>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !componentName.trim() || !title.trim() || !userUid}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('admin.addInfographic.creatingButton')}
                      </>
                    ) : (
                      <>
                        <FilePlus2 className="h-4 w-4 mr-2" />
                        {t('admin.addInfographic.createButton')}
                      </>
                    )}
                  </Button>
                  {createResult?.success && (
                    <Button asChild variant="outline">
                      <Link href="/infographics">{t('admin.addInfographic.viewInfographics')}</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Integration */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.addInfographic.step3Title')}</CardTitle>
            <CardDescription>
              {t('admin.addInfographic.step3Description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>{t('admin.addInfographic.step3Item1')}</li>
              <li>{t('admin.addInfographic.step3Item2')}</li>
              <li>{t('admin.addInfographic.step3Item3')}</li>
              <li>{t('admin.addInfographic.step3Item4')}</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
