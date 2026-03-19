import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string' || !email.trim()) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const origin = request.headers.get('origin') || '';
        const base =
            origin ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'http://localhost:3000';

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: `${base}/reset-password`,
        });

        if (error) {
            console.error('resetPasswordForEmail error:', error);
            const message =
                (error as any)?.message ||
                (Array.isArray((error as any)?.reasons) && (error as any).reasons[0]?.message) ||
                'Failed to send reset email';
            return NextResponse.json({ error: message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Password reset email sent if the account exists.' });
    } catch (e) {
        console.error('Forgot password error:', e);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

