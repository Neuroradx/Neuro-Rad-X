"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsAuthLoading(true);
            if (user) {
                try {
                    // Force refresh token to ensure we have the latest claims
                    const tokenResult = await user.getIdTokenResult(true);
                    const userIsAdmin = !!tokenResult.claims.admin;
                    setIsAdmin(userIsAdmin);
                } catch (error) {
                    console.error("Error verifying admin claims:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
                router.push('/auth/login');
            }
            setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (isAuthLoading) {
        return (
            <div className="container mx-auto py-8 flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">{t('common.loading') || 'Verifying permissions...'}</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto py-12 max-w-2xl">
                <Alert variant="destructive" className="border-2">
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle className="text-xl font-bold mb-2">
                        {t('admin.accessDenied.title') || 'Acceso Denegado'}
                    </AlertTitle>
                    <AlertDescription className="text-base text-destructive-foreground/80">
                        {t('admin.accessDenied.description') || 'No tienes permisos suficientes para acceder a esta sección de administración.'}
                    </AlertDescription>
                </Alert>
                <div className="mt-8 flex justify-center">
                    <Button
                        size="lg"
                        onClick={() => router.push('/dashboard')}
                    >
                        {t('admin.accessDenied.backToDashboard') || 'Volver al Dashboard'}
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
