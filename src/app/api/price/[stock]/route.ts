import { NextResponse } from 'next/server';
import { getCurrentPrice } from '@/lib/stocks';
import { STOCKS } from '@/lib/stocks';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ stock: string }> }
) {
    const { stock } = await params;
    const ticker = stock.toUpperCase();

    if (!STOCKS.includes(ticker) && !STOCKS.includes(ticker + '-USD')) {
        return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
    }

    const price = await getCurrentPrice(ticker);
    return NextResponse.json({ stock: ticker, price });
}
