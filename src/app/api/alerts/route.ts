import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('price_alerts')
        .select('id, ticker, condition, target_price, is_active, triggered_at, created_at')
        .eq('user_id', session.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alerts: data });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const ticker = (body.ticker || '').toUpperCase().trim();
    const condition = body.condition;
    const targetPrice = parseFloat(body.targetPrice);

    if (!ticker) return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    if (!['above', 'below'].includes(condition)) return NextResponse.json({ error: 'Condition must be above or below' }, { status: 400 });
    if (isNaN(targetPrice) || targetPrice <= 0) return NextResponse.json({ error: 'Target price must be a positive number' }, { status: 400 });

    const { data, error } = await supabase
        .from('price_alerts')
        .insert({
            user_id: session.userId,
            ticker,
            condition,
            target_price: targetPrice,
        })
        .select('id, ticker, condition, target_price, is_active, created_at')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alert: data });
}
