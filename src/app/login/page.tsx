'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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

    return (
        <div className="form-container" style={{ marginTop: '80px' }}>
            <h2>Login</h2>
            {error && <div className="alert alert-error">{error}</div>}
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
            <p>Don&apos;t have an account? <Link href="/register">Register</Link></p>
        </div>
    );
}
