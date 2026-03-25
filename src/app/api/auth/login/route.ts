import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/models';
import { getSession } from '@/lib/session';
import { supabase, createAuthedClient } from '@/lib/supabaseClient';

const STARTING_CASH = 100_000;

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const email = username.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.user) {
            console.error('signInWithPassword error:', error);
            const message =
                (error as any)?.message ||
                (Array.isArray((error as any)?.reasons) && (error as any).reasons[0]?.message) ||
                'Invalid email or password';
            return NextResponse.json({ error: message }, { status: 401 });
        }

        let user = await getUserById(data.user.id);

        if (!user) {
            // Profile is missing — create it now using the authenticated session so
            // that RLS auth.uid() = id is satisfied without a service-role key.
            const authedClient = createAuthedClient(data.session!.access_token);

            const { data: profileData, error: profileError } = await authedClient
                .from('profiles')
                .insert({ id: data.user.id, username: email, cash: STARTING_CASH })
                .select('id, username, cash, created_at')
                .maybeSingle();

            if (profileError) {
                console.error('Self-heal createProfile error:', profileError);
                return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
            }

            user = profileData;
        }

        if (!user) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 401 });
        }

        const session = await getSession();
        session.userId = user.id;
        await session.save();

        return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (e) {
        console.error('Login error:', e);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
