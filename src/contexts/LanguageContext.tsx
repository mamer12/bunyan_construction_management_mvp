import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../locales/translations';

type Language = 'en' | 'ar';
type Translations = typeof translations.en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof Translations) => string;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setStateLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang) {
            setStateLanguage(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setStateLanguage(lang);
        localStorage.setItem('app-language', lang);
        document.documentElement.dir = translations[lang].direction;
        document.documentElement.lang = lang;
    };

    // Initialize HTML tag direction on mount
    useEffect(() => {
        document.documentElement.dir = translations[language].direction;
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: keyof Translations) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir: translations[language].direction as 'ltr' | 'rtl' }}>
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
