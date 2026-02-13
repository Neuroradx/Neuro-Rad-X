'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { COMPONENT_MAP } from '@/lib/infographic-registry'; // Import from the central registry
import { useTranslation } from '@/hooks/use-translation';

export default function InfographicClientPage({ infographicId }: { infographicId: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [InfographicComponent, setInfographicComponent] = useState<React.ElementType | null>(null);

  useEffect(() => {
    // Use the imported map from the central registry
    const component = COMPONENT_MAP[infographicId];
    if (component) {
      setInfographicComponent(() => component);
    } else {
      setInfographicComponent(null);
    }
    setIsLoading(false);
  }, [infographicId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('infographics.backToList')}
      </Button>

      {InfographicComponent ? (
        <InfographicComponent />
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('infographics.notFoundTitle')}</AlertTitle>
          <AlertDescription>
            {t('infographics.notFoundDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
