'use client';

import { useEffect } from 'react';

export function applyTheme(theme: string) {
    const resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : (theme === 'light' ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
}

export default function ThemeProvider({ initialTheme }: { initialTheme?: string }) {
    useEffect(() => {
        const saved = localStorage.getItem('vt-theme') || initialTheme || 'dark';
        applyTheme(saved);

        // Keep in sync when system preference changes and user chose "system"
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onSystemChange = () => {
            if ((localStorage.getItem('vt-theme') || 'dark') === 'system') applyTheme('system');
        };
        mq.addEventListener('change', onSystemChange);
        return () => mq.removeEventListener('change', onSystemChange);
    }, [initialTheme]);

    return null;
}
