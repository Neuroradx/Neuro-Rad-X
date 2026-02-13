"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Users, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminEvaluatorsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluatorUrl = "https://www.neuroradx.de/auth/register?coupon=EV25RMK";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
          setIsAdmin(userIsAdmin);
          if (!userIsAdmin) {
            setError(t('admin.accessDenied.description'));
          }
        } catch (err) {
          console.error("Error verifying admin status:", err);
          setIsAdmin(false);
          setError(t('admin.accessDenied.description'));
        }
      } else {
        setIsAdmin(false);
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router, t]);

  if (isAuthLoading) {
    return <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('admin.accessDenied.title')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">{t('admin.accessDenied.backToDashboard')}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('admin.evaluatorsPage.title')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t('admin.evaluatorsPage.description')}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('admin.evaluatorsPage.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg">{t('admin.evaluatorsPage.p1')}</p>
          <p className="text-muted-foreground">{t('admin.evaluatorsPage.p2')}</p>
          <p className="text-muted-foreground">{t('admin.evaluatorsPage.p3')}</p>
          
          <div className="flex justify-center py-4">
            <div className="p-4 border rounded-lg bg-white">
               <QRCodeSVG value={evaluatorUrl} size={192} />
            </div>
          </div>

          <p className="text-muted-foreground">
            {t('admin.evaluatorsPage.p4')}
          </p>
          <p className="font-mono text-sm bg-muted p-2 rounded break-all">{evaluatorUrl}</p>
          <p className="font-semibold mt-4">{t('admin.evaluatorsPage.p6')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
