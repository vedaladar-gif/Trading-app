import { NextResponse } from 'next/server';
import { supabase, createAuthedClient } from '@/lib/supabaseClient';

const STARTING_CASH = 100_000;

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!email?.trim() || !password?.trim()) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const displayName = (username?.trim() || cleanEmail);

        // 1. Create the Supabase auth user
        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password.trim(),
            options: { data: { username: displayName } },
        });

        if (error || !data.user) {
            console.error('signUp error:', error);
            return NextResponse.json(
                { error: error?.message || 'Registration failed' },
                { status: 400 }
            );
        }

        // 2. Create the profile row.
        //    If Supabase returned a session (email-confirm disabled) we use an
        //    authenticated client so RLS auth.uid() = id is satisfied.
        //    If there is no session yet (email-confirm enabled) we still attempt
        //    the insert — it will succeed if the table has an open insert policy
        //    or a trigger; otherwise the login self-heal will create it later.
        const client = data.session?.access_token
            ? createAuthedClient(data.session.access_token)
            : supabase;

        const { error: profileError } = await client
            .from('profiles')
            .insert({ id: data.user.id, username: displayName, cash: STARTING_CASH });

        if (profileError) {
            // Non-fatal: if the profile already exists (duplicate key) that is fine.
            // Any other error is logged so it can be debugged in the server console.
            if (profileError.code !== '23505') {
                console.error('createProfile error during register:', profileError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Register error:', e);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
