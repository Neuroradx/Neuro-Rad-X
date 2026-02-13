
"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, type AuthError, type ActionCodeSettings } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Info, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { COUNTRIES_LIST } from "@/lib/countries";
import Link from "next/link";
import { syncUserProfile } from "@/actions/user-data-actions";

const getRegistrationFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string()
    .min(1, { message: t('validation.firstNameRequired') })
    .min(2, { message: t('validation.firstNameMinLength') }),
  lastName: z.string()
    .min(1, { message: t('validation.lastNameRequired') })
    .min(2, { message: t('validation.lastNameMinLength') }),
  email: z.string().email({ message: t('validation.emailInvalid') }),
  password: z.string().min(6, { message: t('validation.passwordMinLength') }),
  confirmPassword: z.string(),
  country: z.string().optional().default(""),
  institution: z.string().optional(),
  coupon: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: t('validation.passwordsDontMatch'),
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<ReturnType<typeof getRegistrationFormSchema>>;

export function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(getRegistrationFormSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      institution: "",
      coupon: "",
    },
  });

  useEffect(() => {
    const couponCode = searchParams.get('coupon');
    if (couponCode) {
      form.setValue('coupon', couponCode);
    }
  }, [searchParams, form]);

  async function onSubmit(data: RegistrationFormValues) {
    setIsLoading(true);
    setFirebaseError(null);

    const continueUrl = typeof window !== "undefined"
      ? `${window.location.origin}/login` 
      : "https://www.neuroradx.de/login";

    const actionCodeSettings: ActionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: true,
    };

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        const displayName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        await updateProfile(user, {
          displayName: displayName,
        });

        // SECURE SYNC: Send data to server action.
        // The server will assign the correct role and status based on hidden lists.
        const syncResult = await syncUserProfile({
          uid: user.uid,
          email: data.email,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          country: data.country,
          institution: data.institution,
        });

        if (!syncResult.success) {
          throw new Error(syncResult.error || "Failed to create user profile.");
        }

        await sendEmailVerification(user, actionCodeSettings);
      }

      toast({
        title: t('toast.registrationAlmostCompleteTitle'),
        description: t('toast.registrationAlmostCompleteDescription'),
        variant: "success",
        duration: 9000,
      });
      router.push("/auth/login");

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = t('registrationForm.errorUnexpected');

      if (authError.code === "auth/email-already-in-use") {
        errorMessage = t('registrationForm.errorEmailInUse');
      } else if (authError.code === "auth/weak-password") {
        errorMessage = t('registrationForm.errorWeakPassword');
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = t('registrationForm.errorTooManyRequests');
      } else {
        errorMessage = error instanceof Error ? error.message : t('registrationForm.errorGenericWithMessage', { message: authError.message || "" });
      }

      setFirebaseError(errorMessage);
      toast({
        title: t('registrationForm.errorTitle'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t('registrationForm.title')}</CardTitle>
        <CardDescription>{t('registrationForm.description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Alert variant="default" className="border-primary/50 bg-primary/5 dark:bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="font-bold text-primary">{t('registrationForm.trialInfoTitle')}</AlertTitle>
              <AlertDescription className="text-foreground/90">
                {t('registrationForm.trialInfoDescription')}
              </AlertDescription>
            </Alert>
            {firebaseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('registrationForm.errorTitle')}</AlertTitle>
                <AlertDescription>{firebaseError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="firstName">{t('registrationForm.firstNameLabel')}</FormLabel>
                    <FormControl>
                      <Input id="firstName" placeholder={t('registrationForm.firstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="lastName">{t('registrationForm.lastNameLabel')}</FormLabel>
                    <FormControl>
                      <Input id="lastName" placeholder={t('registrationForm.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">{t('registrationForm.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder={t('registrationForm.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">{t('registrationForm.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input id="password" type="password" placeholder={t('registrationForm.passwordPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">{t('registrationForm.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input id="confirmPassword" type="password" placeholder={t('registrationForm.confirmPasswordPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="country-register-select">{t('settingsPage.countryLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger id="country-register-select">
                          <SelectValue placeholder={t('settingsPage.countrySelectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES_LIST.map(c => (
                          <React.Fragment key={c.code}>
                            <SelectItem value={c.name}>{c.name}</SelectItem>
                            {c.name === "Spain" && <SelectSeparator />}
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="institution">{t('settingsPage.institutionLabel')}</FormLabel>
                    <FormControl>
                      <Input id="institution" placeholder={t('settingsPage.institutionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="coupon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="coupon">{t('registrationForm.couponLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="coupon" placeholder={t('registrationForm.couponPlaceholder')} {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('registrationForm.submitButton')}
            </Button>
            <p className="px-8 text-center text-xs text-muted-foreground">
              {t('registrationForm.agreeTo')}{" "}
              <Link
                href="/terms-of-use"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('registrationForm.termsOfUse')}
              </Link>
              {t('registrationForm.andPrivacyPolicy')}{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('registrationForm.privacyPolicy')}
              </Link>
              .
            </p>
            <Button variant="link" size="sm" className="text-sm" onClick={() => router.push('/auth/login')} type="button">
              {t('registrationForm.loginLink')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
