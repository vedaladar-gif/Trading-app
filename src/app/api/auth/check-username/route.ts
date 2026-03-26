import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { USERNAME_REGEX } from '@/lib/avatarColors';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();
    const excludeId = searchParams.get('excludeId'); // current user's id when changing their own name

    if (!username) {
        return NextResponse.json({ available: false, error: 'No username provided' });
    }
    if (!USERNAME_REGEX.test(username)) {
        return NextResponse.json({ available: false, error: 'Invalid username format' });
    }

    // Case-insensitive uniqueness check using the lower index
    let query = supabase
        .from('profiles')
        .select('id')
        .ilike('username', username);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error('check-username error:', error);
        return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({ available: !data });
}
