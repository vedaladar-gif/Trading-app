import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';
import { STARTING_CASH } from '@/lib/stocks';

export async function GET() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, cash')
        .order('cash', { ascending: false })
        .limit(10);

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    const leaderboard = (data || []).map((user, index) => ({
        rank: index + 1,
        username: user.username,
        cash: user.cash,
        pl: user.cash - STARTING_CASH,
        pct: ((user.cash - STARTING_CASH) / STARTING_CASH) * 100,
        isCurrentUser: user.id === session.userId,
    }));

    return NextResponse.json({ leaderboard });
}