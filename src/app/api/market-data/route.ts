import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinance as any)();

const TICKER_SYMS = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD'];

interface MarketItem {
    sym: string;
    price: number;
    change: number;
    changePct: number;
}

let cache: { data: MarketItem[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export async function GET() {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
        return NextResponse.json({ data: cache.data });
    }

    const results = await Promise.allSettled(
        TICKER_SYMS.map(async (sym) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const q: any = await yf.quote(sym);
            return {
                sym,
                price: q.regularMarketPrice ?? 0,
                change: q.regularMarketChange ?? 0,
                changePct: q.regularMarketChangePercent ?? 0,
            } as MarketItem;
        })
    );

    const data = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<MarketItem>).value);

    cache = { data, ts: Date.now() };
    return NextResponse.json({ data });
}
