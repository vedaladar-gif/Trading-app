'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');

        if (!password.trim() || password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                console.error('updateUser error:', error);
                setError('Failed to reset password. The reset link may be invalid or expired.');
            } else {
                setInfo('Password reset successfully. Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            }
        } catch {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="form-container" style={{ marginTop: '80px' }}>
            <h2>Reset Password</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {info && <div className="alert alert-info">{info}</div>}
            <form onSubmit={handleSubmit}>
                <label>
                    New password
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />
                </label>
                <label>
                    Confirm new password
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />
                </label>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset password'}
                </button>
            </form>
        </div>
    );
}

