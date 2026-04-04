'use client';

import { useEffect } from 'react';
import TermsModal from '@/components/TermsModal';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';

/**
 * Blocks the app with a terms modal until the logged-in user accepts.
 * Mount once in the root layout (client). Public pages: /me returns unauthenticated → no modal.
 */
export default function TermsGate() {
    const { ready, needsModal, accept, decline, accepting, declining } = useTermsAcceptance();

    useEffect(() => {
        if (!ready || !needsModal) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [ready, needsModal]);

    if (!ready || !needsModal) return null;

    return <TermsModal onAccept={() => void accept()} onDecline={() => void decline()} accepting={accepting} declining={declining} />;
}
