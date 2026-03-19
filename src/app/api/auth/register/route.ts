import { NextResponse } from 'next/server';
import { createProfile } from '@/lib/models';
import { STARTING_CASH } from '@/lib/stocks';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password?.trim()) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        if (password.trim().length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        const email = username.trim().toLowerCase();

        // Use Supabase Auth as the source of truth
        const { data, error } = await supabase.auth.signUp({
            email,
            password: password.trim(),
        });

        if (error || !data.user) {
            console.error('Supabase signUp error:', error);
            const message =
                (error as any)?.message ||
                (Array.isArray((error as any)?.reasons) && (error as any).reasons[0]?.message) ||
                'Registration failed';
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const profile = await createProfile(data.user.id, email, STARTING_CASH);
        if (!profile) {
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Account created. You can now log in.',
        });
    } catch (e) {
        console.error('Register error:', e);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
