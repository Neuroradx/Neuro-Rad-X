"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Award, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminEcmitPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const ecmintUrl = "https://www.neuroradx.com/auth/register?coupon=ECMINT25";

  // AdminLayout guarantees auth and admin status


  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.ecmit.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.ecmit.description')}</p>
        </div>
      </div>

      <Card className="rounded-xl border-border/80 overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('admin.ecmit.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg">{t('admin.ecmit.p1')}</p>
          <p className="text-muted-foreground">{t('admin.ecmit.p2')}</p>
          <p className="text-muted-foreground">{t('admin.ecmit.p3')}</p>

          <div className="flex justify-center py-4">
            <div className="p-4 border rounded-lg bg-white">
              <QRCodeSVG value={ecmintUrl} size={192} />
            </div>
          </div>

          <p className="text-muted-foreground">
            {t('admin.ecmit.p4')}
          </p>
          <p className="font-mono text-sm bg-muted p-2 rounded break-all">{ecmintUrl}</p>
          <p className="font-semibold mt-4">{t('admin.ecmit.p6')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
