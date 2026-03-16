import { NextResponse } from 'next/server';
import { checkPassword, getUserByUsername } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username?.trim() || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const valid = checkPassword(username.trim(), password);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        const user = getUserByUsername(username.trim());
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
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
