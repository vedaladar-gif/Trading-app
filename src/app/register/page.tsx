'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email.trim(), email: email.trim(), password }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh', background: '#060810',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter, sans-serif', margin: '-48px -24px 0', padding: '24px',
            }}>
                <div style={{
                    width: '100%', maxWidth: '420px',
                    background: '#0d1117',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px', padding: '48px 40px', textAlign: 'center',
                }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'rgba(79,110,247,0.1)',
                        border: '1px solid rgba(79,110,247,0.2)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px', fontSize: '28px',
                    }}>📧</div>

                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                        Check your email
                    </h1>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 8px', lineHeight: 1.6 }}>
                        We sent a confirmation link to
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#7d9bff', margin: '0 0 24px' }}>
                        {email}
                    </p>
                    <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 32px', lineHeight: 1.6 }}>
                        Click the link in your email to activate your account. Check your spam folder if you don&apos;t see it.
                    </p>

                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px', padding: '16px',
                        marginBottom: '28px', textAlign: 'left',
                    }}>
                        {[
                            { step: '1', text: 'Open your email inbox' },
                            { step: '2', text: 'Find the email from Vestera' },
                            { step: '3', text: 'Click "Confirm your email"' },
                            { step: '4', text: "You're in — go to login!" },
                        ].map(item => (
                            <div key={item.step} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '8px 0',
                                borderBottom: item.step !== '4' ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}>
                                <div style={{
                                    width: '22px', height: '22px',
                                    background: 'rgba(79,110,247,0.15)',
                                    borderRadius: '6px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 700, color: '#4f6ef7', flexShrink: 0,
                                }}>{item.step}</div>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <Link href="/login" style={{
                        display: 'block', padding: '12px',
                        background: '#4f6ef7', color: '#fff',
                        borderRadius: '10px', textDecoration: 'none',
                        fontSize: '14px', fontWeight: 600, marginBottom: '12px',
                    }}>Go to Login</Link>

                    <p style={{ fontSize: '12px', color: '#1f2937', margin: 0 }}>
                        For educational purposes only. Not financial advice.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#060810',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif', margin: '-48px -24px 0', padding: '24px',
        }}>
            <div style={{
                width: '100%', maxWidth: '420px',
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', padding: '40px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #4f6ef7, #9b5de5)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '18px', color: '#fff', fontWeight: 700,
                    }}>V</div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                        Create your account
                    </h1>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
                        Start trading with $100K virtual cash
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px', padding: '12px 14px',
                        marginBottom: '16px', fontSize: '13px', color: '#f87171',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                padding: '11px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '9px', color: '#e8eaf0',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                padding: '11px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '9px', color: '#e8eaf0',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px', background: '#4f6ef7',
                            color: '#fff', border: 'none', borderRadius: '10px',
                            fontSize: '14px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, marginTop: '4px',
                        }}
                    >{loading ? 'Creating...' : 'Create Account'}</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#4b5563' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#4f6ef7', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#1f2937' }}>
                    For educational purposes only. Not financial advice.
                </p>
            </div>
        </div>
    );
}