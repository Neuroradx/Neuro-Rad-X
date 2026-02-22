"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ArrowLeft, FileCheck } from 'lucide-react';
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('__all__');

  const subcategoryOptions = useMemo(() => {
    if (!category || !MENU_DATA.sub_main_location[category]) return [];
    return Object.keys(MENU_DATA.sub_main_location[category]);
  }, [category]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        setIsAdmin(userIsAdmin);
        setCurrentUser(user);
      } else {
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

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

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 rounded-xl border bg-card p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('admin.reviewQuestions.loadingShort')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertTitle>{t('admin.reviewQuestions.accessDenied')}</AlertTitle>
          <AlertDescription>{t('admin.reviewQuestions.adminRequired')}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/dashboard">{t('admin.reviewQuestions.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-primary" /> {t('admin.reviewQuestions.title')}
        </h1>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="border-primary/10 shadow-sm overflow-hidden">
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
