import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { deleteUserAccount } from '@/lib/models';

export async function POST() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await deleteUserAccount(session.userId);
    if (success) {
        session.destroy();
        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
}
