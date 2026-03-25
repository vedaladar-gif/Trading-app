import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
    const session = await getSession();
    // destroy() clears session data; save() writes the expired Set-Cookie header
    // so the browser actually removes the cookie (belt-and-suspenders).
    session.destroy();
    await session.save();
    return NextResponse.json({ success: true });
}
