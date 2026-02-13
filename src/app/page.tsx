"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/logo';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Wand, Database, Brain, Sparkles, TrendingUp, Bookmark } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Static constant for the last publication date. 
 * Update this string manually whenever a major change is published.
 */
const LAST_PUBLICATION_DATE = "2025-10-09";

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Database,
      titleKey: "homePage.features.bank.title",
      descriptionKey: "homePage.features.bank.description"
    },
    {
      icon: Brain,
      titleKey: "homePage.features.tools.title",
      descriptionKey: "homePage.features.tools.description"
    },
    {
      icon: TrendingUp,
      titleKey: "homePage.features.progress.title",
      descriptionKey: "homePage.features.progress.description"
    },
    {
      icon: Sparkles,
      titleKey: "homePage.features.ai.title",
      descriptionKey: "homePage.features.ai.description"
    },
    {
      icon: Bookmark,
      titleKey: "homePage.features.validation.title",
      descriptionKey: "homePage.features.validation.description"
    },
    {
      icon: Brain,
      titleKey: "homePage.features.multilingual.title",
      descriptionKey: "homePage.features.multilingual.description"
    }
  ];

  return (
    <div className="relative flex flex-col min-h-screen w-full text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b">
        <Logo size={32} />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden sm:flex gap-2 ml-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">{t('userNav.logIn')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/register">{t('userNav.register')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center pt-32 pb-20 px-4">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="absolute h-[300px] w-[300px] bg-primary/30 rounded-full blur-3xl filter -translate-x-1/2 -translate-y-1/2 left-1/4 top-1/4 animate-pulse"></div>
            <div className="absolute h-[300px] w-[300px] bg-secondary/30 rounded-full blur-3xl filter translate-x-1/2 translate-y-1/2 right-1/4 bottom-1/4 animate-pulse delay-1000"></div>
          </div>
          <div className="relative z-10 max-w-4xl">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-3 py-1 text-xs font-medium uppercase tracking-wider">
              {t('homePage.trialBadge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              {t('homePage.titlePart1')} <span className="text-primary underline decoration-primary/30">NeuroRadX</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('homePage.description')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20">
                <Link href="/auth/register">
                  {t('homePage.registerButton')} <Wand className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                <Link href="/auth/login">
                  {t('homePage.signInButton')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('homePage.features.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border-none bg-background">
                    <CardHeader className="flex items-center text-center pb-2">
                      <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                      <p className="text-sm leading-relaxed">{t(feature.descriptionKey)}</p>
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
            <p className="text-center md:text-left">&copy; {new Date().getFullYear()} NeuroRadX. {t('homePage.copyright')}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-wider">
              {t('homePage.lastUpdated', { date: LAST_PUBLICATION_DATE })}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">{t('nav.aboutUs')}</Link>
            <Link href="/impressum" className="hover:text-primary transition-colors">{t('homePage.impressumLink')}</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">{t('registrationForm.privacyPolicy')}</Link>
            <Link href="/terms-of-use" className="hover:text-primary transition-colors">{t('registrationForm.termsOfUse')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
