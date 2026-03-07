"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ArrowLeft, FileCheck, Bookmark } from 'lucide-react';
import { MENU_DATA } from '@/lib/question-counts';
import { useTranslation } from '@/hooks/use-translation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORY_KEYS = Object.keys(MENU_DATA.main_localization) as string[];

export default function ReviewQuestionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('__all__');

  const subcategoryOptions = useMemo(() => {
    if (!category || !MENU_DATA.sub_main_location[category]) return [];
    return Object.keys(MENU_DATA.sub_main_location[category]);
  }, [category]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (category) setSubcategory('__all__');
  }, [category]);

  const handleStartReview = () => {
    if (!category) return;
    const params = new URLSearchParams();
    params.set('category', category);
    if (subcategory && subcategory !== '__all__') params.set('subcategory', subcategory);
    router.push(`/admin/review-questions/session?${params.toString()}`);
  };


  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" className="border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild title={t('nav.bookmarks')}>
            <Link href="/bookmarks">
              <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.reviewQuestions.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.reviewQuestions.chooseCategoryDescription')}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="rounded-xl border-border/80 shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
              {t('admin.reviewQuestions.chooseCategoryTitle')}
            </CardTitle>
            <CardDescription>
              {t('admin.reviewQuestions.chooseCategoryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('admin.reviewQuestions.categoryLabel')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.reviewQuestions.selectCategoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_KEYS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`topics.${cat.toLowerCase()}`, { defaultValue: cat })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subcategoryOptions.length > 0 && (
              <div className="space-y-2">
                <Label>{t('admin.reviewQuestions.subcategoryLabel')}</Label>
                <Select value={subcategory || '__all__'} onValueChange={setSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.reviewQuestions.allSubcategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('admin.reviewQuestions.allSubcategories')}</SelectItem>
                    {subcategoryOptions.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {t(`subtopics.${sub.toLowerCase().replace(/\s+/g, '')}`, { defaultValue: sub })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleStartReview}
              disabled={!category}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              {t('admin.reviewQuestions.startReviewingButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
