import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';
import { STARTING_CASH } from '@/lib/stocks';
import { isEmailUsername } from '@/lib/avatarColors';

export async function GET() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_color, cash')
        .order('cash', { ascending: false })
        .limit(10);

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    const leaderboard = (data || [])
        // Filter out users who haven't set a real username yet
        .filter(u => !isEmailUsername(u.username))
        .map((user, index) => ({
            rank: index + 1,
            username: user.username,
            displayName: user.display_name,
            avatarColor: user.avatar_color || 'blue',
            cash: user.cash,
            pl: user.cash - STARTING_CASH,
            pct: ((user.cash - STARTING_CASH) / STARTING_CASH) * 100,
            isCurrentUser: user.id === session.userId,
        }));

    return NextResponse.json({ leaderboard });
}
