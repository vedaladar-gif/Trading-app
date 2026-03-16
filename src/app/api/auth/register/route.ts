import { NextResponse } from 'next/server';
import { createUser } from '@/lib/models';
import { STARTING_CASH } from '@/lib/stocks';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password?.trim()) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const user = createUser(username.trim(), password.trim(), STARTING_CASH);
        if (!user) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Account created! Please login.' });
    } catch (e) {
        console.error('Register error:', e);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
