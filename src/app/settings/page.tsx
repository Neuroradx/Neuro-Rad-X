
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";


import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle as UIAlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, UserCircle, Settings as SettingsIcon, Palette, Sun, Moon, Database, ShieldCheck, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { ResetStatisticsDialog } from "@/components/settings/reset-statistics-dialog";
import { COUNTRIES_LIST } from "@/lib/countries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


// --- Schema Definition ---
const getProfileFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, { message: t('validation.firstNameMinLength') }).max(50),
  lastName: z.string().min(2, { message: t('validation.lastNameMinLength') }).max(50),
  country: z.string().optional(),
  institution: z.string().optional(),
  userDeclaredSpecialization: z.string().optional(),
  profession: z.string().optional(),
});

type ProfileFormValues = z.infer<ReturnType<typeof getProfileFormSchema>>;

// --- Option keys for dropdowns ---
const professionKeys = [
  "neuroradiologist", "radiologist", "neurologist", "neurosurgeon", "other"
];
const specializationKeys = [
  "subspecialist", "fellow", "specialist", "resident", "student"
];


// --- Main Settings Page Component ---
export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // State Management
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and Profile Loading Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setError(t('auth.profileFetchErrorDescription'));
          }
        } catch (e: any) {
          setError(e.message || t('auth.profileFetchErrorDescription'));
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router, t]);

  // Loading and Error States
  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <UIAlertTitle>{t('common.errorTitle')}</UIAlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <SettingsPageSkeleton />;
  }
  
  if(currentUser.isAnonymous) {
     return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <UIAlertTitle>{t('auth.loginRequiredTitle')}</UIAlertTitle>
          <AlertDescription>{t('auth.pleaseLogInSettings')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{t('settingsPage.title')}</h1>
      </div>
      <p className="text-muted-foreground">{t('settingsPage.description')}</p>

      <ProfileForm currentUser={currentUser} userProfile={userProfile} />
      <AppearanceSettings />
      <SubscriptionAndDataManagement userProfile={userProfile} currentUser={currentUser} />
    </div>
  );
}

// --- Sub-components for Settings Sections ---

function ProfileForm({ currentUser, userProfile }: { currentUser: FirebaseUser; userProfile: UserProfile }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const profileFormSchema = useMemo(() => getProfileFormSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      country: userProfile.country || '',
      institution: userProfile.institution || '',
      userDeclaredSpecialization: userProfile.userDeclaredSpecialization || '',
      profession: userProfile.profession || '',
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const newDisplayName = `${data.firstName} ${data.lastName}`.trim();
      
      const updateData: Partial<UserProfile> = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: newDisplayName,
        country: data.country,
        institution: data.institution,
        userDeclaredSpecialization: data.userDeclaredSpecialization,
        profession: data.profession,
      };

      await updateDoc(userDocRef, updateData);
      
      if (currentUser.displayName !== newDisplayName) {
        await updateProfile(currentUser, { displayName: newDisplayName });
      }

      toast({
        title: t('toast.profileSavedSuccessTitle'),
        description: t('toast.profileSavedSuccessDescription'),
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: t('toast.saveFailedTitle'),
        description: e.message || t('toast.saveFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getAvatarFallback = (displayName: string | null, email: string | null) => {
      if (displayName) {
        const nameParts = displayName.trim().split(/\s+/);
        const firstInitial = nameParts[0]?.[0] || "";
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || "" : "";
        const initials = (firstInitial + lastInitial).toUpperCase();
        if(initials) return initials;
      }
      if (email) {
        return email[0].toUpperCase();
      }
      return <UserCircle className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settingsPage.profileInfo')}</CardTitle>
        <CardDescription>{t('settingsPage.profileInfoDesc')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
             <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                    <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User Avatar"} data-ai-hint="profile large" />
                    <AvatarFallback>{getAvatarFallback(currentUser.displayName, currentUser.email)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5">
                    <p className="text-lg font-semibold">{currentUser.displayName}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settingsPage.firstNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settingsPage.firstNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('settingsPage.lastNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settingsPage.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settingsPage.countryLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('settingsPage.countrySelectPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {COUNTRIES_LIST.map(c => (<SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>))}
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
                    <FormLabel>{t('settingsPage.institutionLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settingsPage.institutionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settingsPage.professionLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('settingsPage.selectProfessionPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionKeys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {t(`settingsPage.professions.${key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="userDeclaredSpecialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settingsPage.specializationLevelLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('settingsPage.selectSpecializationPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specializationKeys.map((key) => (
                           <SelectItem key={key} value={key}>
                            {t(`settingsPage.specializationLevels.${key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {userProfile.role && userProfile.role !== 'user' && (
              <Alert>
                <UIAlertTitle>{t('settingsPage.roleLabel')}</UIAlertTitle>
                <AlertDescription>{t('settingsPage.roleManagedByAdmin')}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settingsPage.saveProfile')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function AppearanceSettings() {
  const { t, language, setLanguage, setTextSize, textSize } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
  ];
  
  const textSizeOptions = [
      { value: 'small', label: t('settingsPage.textSizes.small') },
      { value: 'medium', label: t('settingsPage.textSizes.medium') },
      { value: 'large', label: t('settingsPage.textSizes.large') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />{t('settingsPage.appearance')}</CardTitle>
        <CardDescription>{t('settingsPage.appearanceDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              <Label htmlFor="dark-mode-switch">{t('settingsPage.darkMode')}</Label>
          </div>
          <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>{t('settingsPage.textSize')}</Label>
              <p className="text-sm text-muted-foreground">{t('settingsPage.textSizeDesc')}</p>
            </div>
            <Select value={textSize} onValueChange={(value) => setTextSize(value as 'small' | 'medium' | 'large')}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                    {textSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
           <div>
              <Label>{t('settingsPage.language')}</Label>
              <p className="text-sm text-muted-foreground">{t('settingsPage.selectLanguage')}</p>
            </div>
          <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'de' | 'es')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionAndDataManagement({ userProfile, currentUser }: { userProfile: UserProfile, currentUser: FirebaseUser }) {
  const { t } = useTranslation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const isTrial = userProfile?.subscriptionLevel === 'Trial';

  return (
    <>
      <Card>
        <CardHeader>
           <CardTitle>{t('settingsPage.subscription')}</CardTitle>
           <CardDescription>{t('settingsPage.subscriptionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t('settingsPage.currentPlanLabel')} <Badge variant="secondary" className="capitalize">{t(`settingsPage.plans.${(userProfile.subscriptionLevel || 'free').toLowerCase()}`)}</Badge></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />{t('settingsPage.dataManagement.title')}</CardTitle>
          <CardDescription>{t('settingsPage.dataManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-orange-400/80 bg-orange-500/10 dark:border-orange-500/60 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <UIAlertTitle className="text-orange-700 dark:text-orange-300 font-semibold">{t('settingsPage.dataManagement.resetStatisticsSectionTitle')}</UIAlertTitle>
            <AlertDescription className="text-muted-foreground">
              {t('settingsPage.dataManagement.resetStatisticsWarning')}
              <Button variant="outline" className="mt-3 w-full sm:w-auto" onClick={() => setIsResetOpen(true)} disabled={isTrial}>
                {t('settingsPage.dataManagement.resetStatisticsButton')}
              </Button>
               {isTrial && <p className="text-xs text-muted-foreground mt-2">{t('settingsPage.dataManagement.disabledForTrial')}</p>}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />{t('settingsPage.accountManagement.title')}</CardTitle>
           <CardDescription>{t('settingsPage.accountManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent>
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <UIAlertTitle className="font-semibold">{t('settingsPage.accountManagement.dangerZoneTitle')}</UIAlertTitle>
            <AlertDescription>
              {t('settingsPage.accountManagement.deleteAccountWarning')}
              <Button variant="destructive" className="mt-3 w-full sm:w-auto" onClick={() => setIsDeleteOpen(true)}>
                {t('settingsPage.accountManagement.deleteAccountButton')}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      <DeleteAccountDialog isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
      <ResetStatisticsDialog isOpen={isResetOpen} onOpenChange={setIsResetOpen} currentUser={currentUser} />
    </>
  );
}

const SettingsPageSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-10 w-1/2" />
    <Skeleton className="h-6 w-3/4" />
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);
