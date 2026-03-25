'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/trade');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        setError('');
        setInfo('');
        if (!username.trim()) {
            setError('Enter your email first to reset your password.');
            return;
        }
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to send reset email');
            } else {
                setInfo(data.message || 'Password reset email sent if the account exists.');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#060810',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            margin: '-48px -24px 0',
            padding: '24px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '40px',
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
                    <h1 style={{
                        fontSize: '22px', fontWeight: 700,
                        color: '#fff', margin: '0 0 6px',
                        letterSpacing: '-0.5px',
                    }}>Welcome back</h1>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>Sign in to your Vestera account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px', padding: '12px 14px',
                        marginBottom: '16px', fontSize: '13px', color: '#f87171',
                    }}>{error}</div>
                )}
                {info && (
                    <div style={{
                        background: 'rgba(79,110,247,0.08)',
                        border: '1px solid rgba(79,110,247,0.2)',
                        borderRadius: '8px', padding: '12px 14px',
                        marginBottom: '16px', fontSize: '13px', color: '#7d9bff',
                    }}>{info}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                padding: '11px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '9px',
                                color: '#e8eaf0',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
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
                                borderRadius: '9px',
                                color: '#e8eaf0',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            background: loading ? '#3d5ce8' : '#4f6ef7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.85 : 1,
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background 0.2s, opacity 0.2s',
                        }}
                    >
                        {loading && (
                            <span style={{
                                width: '14px',
                                height: '14px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: '#fff',
                                borderRadius: '50%',
                                display: 'inline-block',
                                animation: 'spin 0.7s linear infinite',
                                flexShrink: 0,
                            }} />
                        )}
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={{
                        width: '100%', marginTop: '10px', padding: '11px',
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px',
                        color: '#4b5563', fontSize: '13px',
                        cursor: 'pointer',
                    }}
                >Forgot password?</button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#4b5563' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" style={{ color: '#4f6ef7', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
                </p>
            </div>
        </div>
    );
}