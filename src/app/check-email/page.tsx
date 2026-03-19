'use client';

import Link from 'next/link';

export default function CheckEmailPage() {
    return (
        <div className="form-container" style={{ marginTop: '80px' }}>
            <h2>Confirm your email</h2>
            <p style={{ marginTop: '8px', marginBottom: '16px' }}>
                We&apos;ve sent a confirmation link to your email address. Please click the link in that email to
                activate your Vestera account.
            </p>
            <ul style={{ marginBottom: '16px' }}>
                <li>• Check your inbox and spam folder.</li>
                <li>• The link may take a few seconds to arrive.</li>
            </ul>
            <p>
                Already confirmed?{' '}
                <Link href="/login">
                    Log in here
                </Link>
                .
            </p>
        </div>
    );
}

