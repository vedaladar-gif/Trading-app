import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserById } from '@/lib/models';
import { isEmailUsername } from '@/lib/avatarColors';

export async function GET() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ authenticated: false });
    }

    const user = await getUserById(session.userId);
    if (!user) {
        return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
        authenticated: true,
        userId: session.userId,
        username: user.username,
        displayName: user.display_name,
        avatarColor: user.avatar_color || 'blue',
        theme: user.theme || 'dark',
        needsUsername: isEmailUsername(user.username),
    });
}
