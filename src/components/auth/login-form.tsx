"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation"; 
import { fetchUserNotifications } from "@/actions/notification-actions";
import { ToastAction } from "@/components/ui/toast";

const getLoginFormSchema = (t: (key: string, ...args: any[]) => string) => z.object({
  email: z.string().email({ message: t('validation.emailInvalid') }),
  password: z.string().min(1, { message: t('validation.passwordRequired') }),
});

type LoginFormValues = z.infer<ReturnType<typeof getLoginFormSchema>>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation(); 
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const loginFormSchema = useMemo(() => getLoginFormSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema), 
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        // Fetch user role from Firestore to determine redirect path
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
             setFirebaseError(t('auth.accountSetupIncompleteDescription'));
             toast({
                title: t('auth.accountSetupIncompleteTitle'),
                description: t('auth.accountSetupIncompleteDescription'),
                variant: "destructive",
             });
             await auth.signOut();
             setIsLoading(false);
             return;
        }

        const userData = userDocSnap.data();

        if (userData.status === 'pending') {
            router.push('/pending-approval');
            return;
        }

        if (userData.status !== 'approved') {
            setFirebaseError(t('auth.accountStatusError'));
            await auth.signOut();
            setIsLoading(false);
            return;
        }

        const isAdmin = userData?.role === 'admin';
        const redirectPath = isAdmin ? "/admin/dashboard" : "/dashboard";

        toast({
          title: t('toast.loginSuccessTitle'),
          description: t('toast.loginSuccessDescription'),
        });

        const result = await fetchUserNotifications(user.uid);
        if (result.success && result.notifications) {
          const hasUnread = result.notifications.some(n => n.status === 'unread');
          if (hasUnread) {
            toast({
              title: t('toast.newNotificationsTitle'),
              description: t('toast.newNotificationsDescription'),
              action: (
                <ToastAction altText={t('toast.newNotificationsAction')} onClick={() => router.push('/settings')}>
                  {t('toast.newNotificationsAction')}
                </ToastAction>
              ),
              duration: 8000,
            });
          }
        }
        router.push(redirectPath);
      } else {
        throw new Error("Login succeeded but user object is null.");
      }

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = t('loginForm.errorUnexpected');
      
      if (authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password" || authError.code === "auth/invalid-credential") {
        errorMessage = t('loginForm.errorInvalidCredentials');
      } else {
        console.error("Unexpected login error:", authError);
      }
      
      setFirebaseError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t('loginForm.title')}</CardTitle>
        <CardDescription>{t('loginForm.description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {firebaseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('loginForm.errorTitle')}</AlertTitle>
                <AlertDescription>{firebaseError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email-login">{t('loginForm.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input id="email-login" type="email" placeholder={t('loginForm.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password-login">{t('loginForm.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input id="password-login" type="password" placeholder={t('loginForm.passwordPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="text-right">
              <Button variant="link" size="sm" className="text-xs text-muted-foreground px-0" asChild>
                <Link href="/forgot-password">
                  {t('loginForm.forgotPasswordLink')}
                </Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('loginForm.submitButton')}
            </Button>
            <Button variant="link" size="sm" className="text-sm" onClick={() => router.push('/auth/register')} type="button">
              {t('loginForm.registerLink')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
