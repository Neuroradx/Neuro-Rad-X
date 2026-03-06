"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  Wand,
  Database,
  Calculator,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { t } = useTranslation();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
    const dateToFormat = buildTime ? new Date(buildTime) : new Date();
    const formatted = dateToFormat.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setLastUpdated(formatted);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const features = [
    {
      icon: Database,
      titleKey: "homePage.features.bank.title",
      descriptionKey: "homePage.features.bank.description",
    },
    {
      icon: Calculator,
      titleKey: "homePage.features.tools.title",
      descriptionKey: "homePage.features.tools.description",
    },
    {
      icon: TrendingUp,
      titleKey: "homePage.features.progress.title",
      descriptionKey: "homePage.features.progress.description",
    },
    {
      icon: Sparkles,
      titleKey: "homePage.features.ai.title",
      descriptionKey: "homePage.features.ai.description",
    },
    {
      icon: ShieldCheck,
      titleKey: "homePage.features.validation.title",
      descriptionKey: "homePage.features.validation.description",
    },
    {
      icon: Languages,
      titleKey: "homePage.features.multilingual.title",
      descriptionKey: "homePage.features.multilingual.description",
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen w-full text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b">
        <Logo size={32} />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="flex gap-2 ml-2">
            {authLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : currentUser ? (
              <UserNav />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">{t("userNav.logIn")}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">{t("userNav.register")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center pt-28 md:pt-32 pb-20 px-4">
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <div className="absolute h-[280px] w-[280px] bg-primary/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 left-1/4 top-1/4 animate-pulse" />
            <div className="absolute h-[280px] w-[280px] bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 right-1/4 bottom-1/4 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative z-10 max-w-4xl">
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary px-3 py-1 text-xs font-medium uppercase tracking-wider"
            >
              {t("homePage.trialBadge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              {t("homePage.titlePart1")}{" "}
              <span className="text-primary underline decoration-primary/30">
                NeuroRadX
              </span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("homePage.description")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {currentUser ? (
                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20">
                  <Link href="/dashboard">
                    {t("homePage.goToDashboard")} <TrendingUp className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20"
                  >
                    <Link href="/auth/register">
                      {t("homePage.registerButton")} <Wand className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base"
                  >
                    <Link href="/auth/login">
                      {t("homePage.signInButton")} <LogIn className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats / Social Proof */}
        <section className="py-12 border-y bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {t("homePage.stats.questions")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("homePage.stats.questionsLabel")}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {t("homePage.stats.studyModes")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("homePage.stats.studyModesLabel")}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {t("homePage.stats.languages")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("homePage.stats.languagesLabel")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t("homePage.features.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border-none bg-background"
                  >
                    <CardHeader className="flex items-center text-center pb-2">
                      <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">
                        {t(feature.titleKey)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                      <p className="text-sm leading-relaxed">
                        {t(feature.descriptionKey)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} NeuroRadX. {t("homePage.copyright")}
            </p>
            {lastUpdated && (
              <p className="text-[10px] opacity-60 uppercase tracking-wider">
                {t("homePage.lastUpdated", { date: lastUpdated })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">
              {t("nav.aboutUs")}
            </Link>
            <Link href="/impressum" className="hover:text-primary transition-colors">
              {t("homePage.impressumLink")}
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              {t("registrationForm.privacyPolicy")}
            </Link>
            <Link href="/terms-of-use" className="hover:text-primary transition-colors">
              {t("registrationForm.termsOfUse")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
