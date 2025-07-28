'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import ru from '@/locales/ru.json';

const translations: Record<string, Record<string, string | Record<string, any>>> = {
  es,
  en,
  fr,
  zh,
  ja,
  ru,
};

type Language = 'es' | 'en' | 'fr' | 'zh' | 'ja' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  const setLanguage = (lang: string) => {
    if (Object.keys(translations).includes(lang)) {
        setLanguageState(lang as Language);
    }
  };

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    const langFile = translations[language];
    let translation = langFile[key] as string;
    
    if (typeof translation === 'string' && options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return translation || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
