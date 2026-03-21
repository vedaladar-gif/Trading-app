'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Account created! Redirecting to login...');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#060810',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
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
                        fontFamily: "'Inter', sans-serif",
                    }}>V</div>
                    <h1 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '22px', fontWeight: 700,
                        color: '#fff', margin: '0 0 6px',
                        letterSpacing: '-0.5px',
                    }}>Create your account</h1>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>Start trading with $100K virtual cash</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px', padding: '12px 14px',
                        marginBottom: '16px', fontSize: '13px', color: '#f87171',
                    }}>{error}</div>
                )}
                {success && (
                    <div style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: '8px', padding: '12px 14px',
                        marginBottom: '16px', fontSize: '13px', color: '#4ade80',
                    }}>{success}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                            style={{
                                padding: '11px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '9px',
                                color: '#e8eaf0',
                                fontSize: '14px',
                                fontFamily: "'Inter', sans-serif",
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
                                fontFamily: "'Inter', sans-serif",
                                outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            background: '#4f6ef7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            opacity: loading ? 0.7 : 1,
                            marginTop: '4px',
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