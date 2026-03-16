import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
    userId?: number;
}

const sessionOptions = {
    password: process.env.SECRET_KEY || 'dev-secret-key-change-in-production-at-least-32-chars',
    cookieName: 'vestera_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 1 week
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}
