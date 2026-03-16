import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from './lib/session';

const protectedPagePaths = ['/trade', '/stats', '/learn', '/learn-unit', '/learn-quiz', '/dashboard'];
const protectedApiPaths = ['/api/trade', '/api/holdings', '/api/analyze-stock', '/api/delete-account', '/api/snapse'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedPage = protectedPagePaths.some(p => pathname === p || pathname.startsWith(p + '/'));
    const isProtectedApi = protectedApiPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (!isProtectedPage && !isProtectedApi) {
        return NextResponse.next();
    }

    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, {
        password: process.env.SECRET_KEY || 'dev-secret-key-change-in-production-at-least-32-chars',
        cookieName: 'vestera_session',
    });

    if (!session.userId) {
        if (isProtectedApi) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/trade/:path*',
        '/stats/:path*',
        '/learn/:path*',
        '/learn-unit/:path*',
        '/learn-quiz/:path*',
        '/dashboard/:path*',
        '/api/trade/:path*',
        '/api/holdings/:path*',
        '/api/analyze-stock/:path*',
        '/api/delete-account/:path*',
        '/api/snapse/:path*',
    ],
};
