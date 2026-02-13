"use client";

import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, Clock, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('auth.pendingApprovalPage.title')}</CardTitle>
          <CardDescription>
            {t('auth.pendingApprovalPage.descriptionLine1')}{" "}
            {t('auth.pendingApprovalPage.descriptionLine2')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            <p>
              {t('auth.pendingApprovalPage.contactSupport')}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('auth.pendingApprovalPage.logoutButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
