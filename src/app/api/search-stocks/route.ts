import { NextResponse } from 'next/server';
import { STOCKS } from '@/lib/stocks';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').toUpperCase().trim();

    if (!query || query.length < 1) {
        return NextResponse.json({ results: [] }, { status: 400 });
    }

    // Filter stocks containing the query, display-friendly (BTC not BTC-USD)
    const displayStocks = STOCKS.map(s => s.replace('-USD', ''));
    const uniqueStocks = [...new Set(displayStocks)];

    const results = uniqueStocks.filter(s => s.includes(query));

    // Sort: exact matches first, then starts with, then contains
    const exact = results.filter(s => s === query);
    const startsWith = results.filter(s => s.startsWith(query) && s !== query);
    const contains = results.filter(s => !exact.includes(s) && !startsWith.includes(s));

    const sorted = [...exact, ...startsWith, ...contains].slice(0, 15);
    return NextResponse.json({ results: sorted });
}
