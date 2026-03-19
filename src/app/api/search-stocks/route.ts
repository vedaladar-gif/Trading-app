import { NextResponse } from 'next/server';
import { STOCKS, STOCK_NAMES } from '@/lib/stocks';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get('q') || '').trim();
    const query = raw.toUpperCase();

    if (!query || query.length < 1) {
        return NextResponse.json({ results: [] }, { status: 400 });
    }

    // Build a list of symbols and names
    const displayStocks = STOCKS.map(s => s.replace('-USD', ''));
    const uniqueStocks = [...new Set(displayStocks)];

    const qLower = raw.toLowerCase();

    // Match by symbol OR by human-friendly name
    const matches = uniqueStocks.filter(sym => {
        const name = STOCK_NAMES[sym] || '';
        return (
            sym.toUpperCase().includes(query) ||
            name.toLowerCase().includes(qLower)
        );
    });

    // Sort: exact symbol, symbol startsWith, name startsWith, then contains
    const exact = matches.filter(sym => sym.toUpperCase() === query);
    const symStarts = matches.filter(sym => sym.toUpperCase().startsWith(query) && !exact.includes(sym));
    const nameStarts = matches.filter(sym => {
        const name = (STOCK_NAMES[sym] || '').toLowerCase();
        return !exact.includes(sym) && !symStarts.includes(sym) && name.startsWith(qLower);
    });
    const contains = matches.filter(
        sym => !exact.includes(sym) && !symStarts.includes(sym) && !nameStarts.includes(sym)
    );

    const sorted = [...exact, ...symStarts, ...nameStarts, ...contains].slice(0, 15);
    return NextResponse.json({ results: sorted });
}
