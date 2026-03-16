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
        <div className="form-container" style={{ marginTop: '80px' }}>
            <h2>Login</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {info && <div className="alert alert-info">{info}</div>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </label>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '8px' }}
                onClick={handleForgotPassword}
                disabled={loading}
            >
                Forgot password?
            </button>
            <p>Don&apos;t have an account? <Link href="/register">Register</Link></p>
        </div>
    );
}
