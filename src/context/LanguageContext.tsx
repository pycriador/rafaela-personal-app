import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, LanguageContextType } from '../types/i18n';
import { pt } from '../locales/pt';
import { en } from '../locales/en';
import { es } from '../locales/es';

const dictionaries: Record<Locale, Record<string, string>> = {
  pt,
  en,
  es,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'pt',
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('rafaela_app_locale');
      if (saved === 'pt' || saved === 'en' || saved === 'es') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'pt';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('rafaela_app_locale', newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      // fallback
    }
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[locale] || dictionaries.pt;
    if (key in dict) {
      return dict[key];
    }
    // Fallback to Portuguese if missing in other languages
    if (key in dictionaries.pt) {
      return dictionaries.pt[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
