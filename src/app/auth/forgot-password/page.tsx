// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

const forgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('validation.emailInvalid') }),
});

type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: t('forgotPasswordPage.toastSuccessTitle'),
        description: t('forgotPasswordPage.successMessage'),
      });
      // Optionally redirect or show a persistent success message on the page
      // router.push("/auth/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setFirebaseError(t('forgotPasswordPage.errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t('forgotPasswordPage.title')}</CardTitle>
        <CardDescription>{t('forgotPasswordPage.description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {firebaseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('forgotPasswordPage.errorTitle')}</AlertTitle>
                <AlertDescription>{firebaseError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email-forgot-password">{t('forgotPasswordPage.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input id="email-forgot-password" type="email" placeholder={t('forgotPasswordPage.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('forgotPasswordPage.submitButton')}
            </Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/auth/login">
                 {t('forgotPasswordPage.backToLogin')}
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
