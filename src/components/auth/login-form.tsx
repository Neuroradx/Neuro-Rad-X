"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/auth-error-messages";
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
          // Server-side admin check (includes allowlist) without exposing allowlist to client
          const token = await user.getIdToken();
          const meRes = await fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } });
          const meData = meRes.ok ? await meRes.json() : { isAdmin: false };
          if (meData.isAdmin) {
            toast({ title: t('toast.loginSuccessTitle'), description: t('toast.loginSuccessDescription') });
            router.push("/admin/dashboard");
            setIsLoading(false);
            return;
          }
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

        if (userData?.status === 'pending') {
          router.push('/pending-approval');
          return;
        }

        if (userData?.status !== 'approved') {
          // Force refresh to get latest claims
          const tokenResult = await user.getIdTokenResult(true);
          const isAdminByClaim = !!tokenResult.claims.admin;

          if (!isAdminByClaim) {
            // Server-side check (includes allowlist) without exposing allowlist to client
            const token = await user.getIdToken();
            const meRes = await fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } });
            const meData = meRes.ok ? await meRes.json() : { isAdmin: false };
            if (!meData.isAdmin) {
              setFirebaseError(t('auth.accountStatusError'));
              await auth.signOut();
              setIsLoading(false);
              return;
            }
          }
        }

        // Use custom claims as the source of truth for the redirect
        const tokenResultForRedirect = await user.getIdTokenResult();
        const isAdmin = !!tokenResultForRedirect.claims.admin;
        const redirectPath = isAdmin ? "/admin/dashboard" : "/dashboard";

        toast({
          title: t('toast.loginSuccessTitle'),
          description: t('toast.loginSuccessDescription'),
        });

        // Fetch notifications in a non-blocking way - never let this fail the login
        try {
          const result = await fetchUserNotifications(user.uid, user.uid);
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
        } catch {
          // Silently ignore - notifications are optional, login must succeed
        }
        router.push(redirectPath);
      } else {
        throw new Error("Login succeeded but user object is null.");
      }

    } catch (error) {
      const authError = error as AuthError;
      setFirebaseError(getAuthErrorMessage(authError, t, "login"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-border/80 rounded-xl overflow-hidden">
      <CardHeader className="space-y-2 pb-4 border-b border-border/50">
        <CardTitle className="text-2xl font-bold tracking-tight">{t('loginForm.title')}</CardTitle>
        <CardDescription className="text-muted-foreground/90">{t('loginForm.description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 px-6 py-5">
            {firebaseError && (
              <Alert variant="destructive" className="rounded-lg">
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
                    <Input id="email-login" type="email" autoComplete="email" placeholder={t('loginForm.emailPlaceholder')} {...field} />
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
                    <Input id="password-login" type="password" autoComplete="current-password" placeholder={t('loginForm.passwordPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right -mt-1">
              <Button variant="link" size="sm" className="text-xs text-muted-foreground px-0 h-auto hover:text-primary transition-colors" asChild>
                <Link href="/auth/forgot-password">
                  {t('loginForm.forgotPasswordLink')}
                </Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 pt-6 border-t border-border/50 bg-muted/20 dark:bg-muted/10">
            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('loginForm.submitButton')}
            </Button>
            <Button variant="outline" size="sm" className="w-full text-sm" asChild>
              <Link href="/auth/register">{t('loginForm.registerLink')}</Link>
            </Button>
            <p className="px-4 text-center text-xs text-muted-foreground leading-relaxed">
              <Link
                href="/terms-of-use"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('registrationForm.termsOfUse')}
              </Link>{" "}
              {t('registrationForm.andPrivacyPolicy')}{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('registrationForm.privacyPolicy')}
              </Link>
              .
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
