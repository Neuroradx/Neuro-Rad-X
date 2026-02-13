"use client";

import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";
import type { Language } from "@/providers/language-provider";
import { useMemo } from "react";

interface LanguageOption {
  code: Language;
  nativeName: string; 
  flag: string; 
}

export function LanguageSwitcher() {
  const { language: currentLanguageCode, setLanguage, t } = useTranslation();

  const languageOptions: LanguageOption[] = useMemo(() => [
    { code: "en", nativeName: "English", flag: "🇬🇧" },
    { code: "de", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "es", nativeName: "Español", flag: "🇪🇸" },
  ], []);

  const sortedLanguageOptions = useMemo(() => {
    return [...languageOptions].sort((a, b) => 
      a.nativeName.localeCompare(b.nativeName)
    );
  }, [languageOptions]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9"
          aria-label={t("languageSwitcher.selectLanguageAriaLabel")}
        >
          <Globe className="h-5 w-5" /> 
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {sortedLanguageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLanguage(option.code)}
            disabled={currentLanguageCode === option.code}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <span role="img" aria-label={option.nativeName} className="text-lg">{option.flag}</span>
              <span>{option.nativeName}</span>
            </div>
            {currentLanguageCode === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
