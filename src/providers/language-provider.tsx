
"use client";

import * as React from "react";
import { getNestedValue } from "@/lib/utils";
import enTranslations from '@/locales/en.json';
import esTranslations from '@/locales/es.json';
import deTranslations from '@/locales/de.json';

export type Language = 'en' | 'es' | 'de';
export type TextSize = 'small' | 'medium' | 'large';

const translations: Record<Language, any> = {
  en: enTranslations,
  es: esTranslations,
  de: deTranslations,
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string> | { defaultValue?: string }) => string;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

export const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('en');
  const [textSize, setTextSizeState] = React.useState<TextSize>('medium');

  React.useEffect(() => {
    const storedLanguage = localStorage.getItem('appLanguage') as Language;
    if (storedLanguage && ['en', 'es', 'de'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
    const storedTextSize = localStorage.getItem('appTextSize') as TextSize;
    if (storedTextSize && ['small', 'medium', 'large'].includes(storedTextSize)) {
      setTextSizeState(storedTextSize);
      document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
      document.body.classList.add(`text-size-${storedTextSize}`);
    }
  }, []);

  const setLanguage = React.useCallback((newLanguage: Language) => {
    if (['en', 'es', 'de'].includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem('appLanguage', newLanguage);
    }
  }, []);

  const setTextSize = React.useCallback((newSize: TextSize) => {
    if (['small', 'medium', 'large'].includes(newSize)) {
      setTextSizeState(newSize);
      localStorage.setItem('appTextSize', newSize);
      document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
      document.body.classList.add(`text-size-${newSize}`);
    }
  }, []);

  const t = React.useCallback((key: string, options?: Record<string, string> | { defaultValue?: string }): string => {
    const currentTranslations = translations[language] || enTranslations;
    let translation = getNestedValue(currentTranslations, key) || getNestedValue(enTranslations, key);

    if (translation === undefined) {
      if (options && typeof options === 'object' && 'defaultValue' in options && typeof options.defaultValue === 'string') {
        return options.defaultValue;
      }
      console.warn(`[Translation] Key '${key}' not found in language '${language}'.`);
      return key;
    }

    if (typeof translation !== 'string') {
        // If the key points to an object, it's likely a mistake. Return the key.
        if (typeof translation === 'object' && translation !== null && !Array.isArray(translation)) {
            console.warn(`[Translation] Key '${key}' resolved to an object. Did you mean to use a more specific key? Using key as fallback.`);
            return key;
        }
        // It might be an array or some other type, but we can't run .replace() on it.
        if (Array.isArray(translation)) {
           console.warn(`[Translation] Key '${key}' resolved to an array. Using key as fallback.`);
           return key;
        }
    }


    if (options && typeof options === 'object' && !('defaultValue' in options)) {
      Object.keys(options).forEach(placeholder => {
        translation = (translation as string).replace(new RegExp(`{{${placeholder}}}`, 'g'), (options as Record<string, string>)[placeholder]);
      });
    }
    
    return translation as string;
  }, [language]);

  const contextValue = React.useMemo(() => ({
    language,
    setLanguage,
    t,
    textSize,
    setTextSize,
  }), [language, setLanguage, t, textSize, setTextSize]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

    