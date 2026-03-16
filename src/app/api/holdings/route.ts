import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserCash, getHoldings } from '@/lib/models';
import { getCurrentPrice, STARTING_CASH } from '@/lib/stocks';

export async function GET() {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const cash = await getUserCash(userId);
    const holdings = await getHoldings(userId);

    // Enrich with current prices
    for (const h of holdings) {
        h.current_price = await getCurrentPrice(h.stock);
        h.value = h.shares * h.current_price;
    }

    const portfolioValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
    const pl = portfolioValue + cash - STARTING_CASH;
    const pct = STARTING_CASH ? (pl / STARTING_CASH * 100) : 0;

    return NextResponse.json({ cash, portfolio_value: portfolioValue, pl, pct, holdings });
}
