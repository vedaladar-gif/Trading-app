'use client';

import styles from './TermsModal.module.css';

type TermsModalProps = {
    onAccept: () => void;
    onDecline: () => void;
    accepting: boolean;
    declining: boolean;
};

export default function TermsModal({ onAccept, onDecline, accepting, declining }: TermsModalProps) {
    return (
        <div
            className={styles.backdrop}
            role="presentation"
            aria-hidden={false}
            onMouseDown={e => e.stopPropagation()}
        >
            <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="terms-modal-title"
                onMouseDown={e => e.stopPropagation()}
            >
                <h2 id="terms-modal-title" className={styles.title}>
                    Terms & Conditions
                </h2>
                <p className={styles.body}>
                    Vestera is a simulated trading and educational platform. All information provided, including
                    AI-generated responses, is for educational purposes only and should not be considered financial
                    advice. No real trades are executed and no guarantees of profit are made. By using this platform,
                    you agree to use it responsibly and understand that investing involves risk.
                </p>
                <p className={styles.note}>
                    This platform is designed to help users learn and practice investing in a safe, simulated
                    environment.
                </p>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={onDecline}
                        disabled={accepting || declining}
                    >
                        {declining ? 'Signing out…' : 'Decline'}
                    </button>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={onAccept}
                        disabled={accepting || declining}
                    >
                        {accepting ? 'Saving…' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    );
}
