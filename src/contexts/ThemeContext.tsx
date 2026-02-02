import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
    effectiveTheme: 'light' | 'dark'; // The actual theme being applied
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setStateTheme] = useState<Theme>('system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    // Get system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    };

    // Apply theme to document
    const applyTheme = (themeToApply: 'light' | 'dark') => {
        const root = document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light', 'dark');
        
        // Add the appropriate class
        root.classList.add(themeToApply);
        
        // Also set data-theme for backward compatibility
        root.setAttribute('data-theme', themeToApply);
        
        setEffectiveTheme(themeToApply);
    };

    // Load saved theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setStateTheme(savedTheme);
            const themeToApply = savedTheme === 'system' ? getSystemTheme() : savedTheme;
            applyTheme(themeToApply);
        } else {
            // Default to system theme
            setStateTheme('system');
            applyTheme(getSystemTheme());
        }
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            applyTheme(getSystemTheme());
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setStateTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
        
        const themeToApply = newTheme === 'system' ? getSystemTheme() : newTheme;
        applyTheme(themeToApply);
    };

    const toggleTheme = () => {
        // If system, toggle to light or dark based on current effective theme
        // Otherwise toggle between light and dark
        if (theme === 'system') {
            const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        } else {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            isDark: effectiveTheme === 'dark',
            effectiveTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
