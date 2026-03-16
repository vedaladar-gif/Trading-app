import { NextResponse } from 'next/server';
import { createProfile } from '@/lib/models';
import { STARTING_CASH } from '@/lib/stocks';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password?.trim()) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // Use Supabase Auth as the source of truth
        const { data, error } = await supabase.auth.signUp({
            email: username.trim(),
            password: password.trim(),
        });

        if (error || !data.user) {
            console.error('Supabase signUp error:', error);
            return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
        }

        const profile = await createProfile(data.user.id, username.trim(), STARTING_CASH);
        if (!profile) {
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Account created! Please login.' });
    } catch (e) {
        console.error('Register error:', e);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
