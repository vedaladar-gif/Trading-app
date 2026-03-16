import { NextResponse } from 'next/server';
import { getHistorical } from '@/lib/stocks';
import { STOCKS } from '@/lib/stocks';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ stock: string }> }
) {
    const { stock } = await params;
    const ticker = stock.toUpperCase();
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 365);

    if (!STOCKS.includes(ticker) && !STOCKS.includes(ticker + '-USD')) {
        return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
    }

    const data = await getHistorical(ticker, days);
    return NextResponse.json({ stock: ticker, history: data });
}
