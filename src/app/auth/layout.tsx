"use client";

import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <header className="flex justify-between items-center p-4 border-b bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('auth.backToHome')}</span>
          </Link>
        </Button>
        <Logo size={28} className="absolute left-1/2 -translate-x-1/2" />
        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
