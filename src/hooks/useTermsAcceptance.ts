'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vestera_terms_accepted_v1';

type MeResponse = {
    authenticated?: boolean;
    userId?: string;
    termsAccepted?: boolean;
};

function readLocalAccepted(userId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const o = JSON.parse(raw) as { userId?: string; accepted?: boolean };
        return o.userId === userId && o.accepted === true;
    } catch {
        return false;
    }
}

function writeLocalAccepted(userId: string) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, accepted: true, at: Date.now() }));
}

export function useTermsAcceptance() {
    const [ready, setReady] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [needsModal, setNeedsModal] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);

    const refresh = useCallback(async () => {
        setReady(false);
        try {
            const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
            const data = (await res.json()) as MeResponse;

            if (!data.authenticated || !data.userId) {
                setUserId(null);
                setNeedsModal(false);
                setReady(true);
                return;
            }

            setUserId(data.userId);

            if (data.termsAccepted === true) {
                setNeedsModal(false);
                setReady(true);
                return;
            }

            if (readLocalAccepted(data.userId)) {
                setNeedsModal(false);
                setReady(true);
                void fetch('/api/auth/accept-terms', { method: 'POST', credentials: 'same-origin' }).then(r => {
                    if (r.ok) writeLocalAccepted(data.userId!);
                });
                return;
            }

            setNeedsModal(true);
            setReady(true);
        } catch {
            setUserId(null);
            setNeedsModal(false);
            setReady(true);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) void refresh();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [refresh]);

    const accept = useCallback(async () => {
        if (!userId) return;
        setAccepting(true);
        try {
            const res = await fetch('/api/auth/accept-terms', { method: 'POST', credentials: 'same-origin' });
            if (res.ok) {
                writeLocalAccepted(userId);
                setNeedsModal(false);
                return;
            }
            writeLocalAccepted(userId);
            setNeedsModal(false);
        } finally {
            setAccepting(false);
        }
    }, [userId]);

    const decline = useCallback(async () => {
        setDeclining(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = '/login';
        } finally {
            setDeclining(false);
        }
    }, []);

    return { ready, needsModal, accept, decline, accepting, declining, refresh };
}
