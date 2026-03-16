import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/models';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: username.trim(),
            password,
        });

        if (error || !data.user) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        const user = await getUserById(data.user.id);
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
