import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { acceptUserTerms } from '@/lib/models';

export async function POST() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ok = await acceptUserTerms(session.userId);
    if (!ok) {
        return NextResponse.json({ error: 'Could not save acceptance' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
