import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { addChatMessage, getUserCash, getHoldings } from '@/lib/models';
import { getCurrentPrice } from '@/lib/stocks';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const data = await request.json();
    const userMessage = (data.message || '').trim();
    const mode = data.mode || 'TRADING';
    const route = data.route || '/trade';
    const stockSymbol = (data.stockSymbol || '').toUpperCase();

    if (!userMessage) {
        return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    try {
        await addChatMessage(userId, 'user', userMessage, mode, route);

        // Fetch user portfolio context
        const cash = await getUserCash(userId);
        const holdings = await getHoldings(userId);

        // Enrich holdings with current prices
        const enrichedHoldings = await Promise.all(holdings.map(async h => {
            const price = await getCurrentPrice(h.stock);
            return { ...h, current_price: price, value: h.shares * price };
        }));

        const portfolioValue = enrichedHoldings.reduce((s, h) => s + h.value, 0);
        const totalAccount = cash + portfolioValue;
        const pl = totalAccount - 100000;

        // Build portfolio summary for context
        const portfolioSummary = holdings.length > 0
            ? `Current holdings: ${enrichedHoldings.map(h => `${h.stock} (${h.shares} shares @ $${h.current_price.toFixed(2)} = $${h.value.toFixed(2)})`).join(', ')}`
            : 'No current holdings';

        const systemPrompt = mode === 'TRADING'
            ? `You are Snapse, an AI trading assistant for Vestera — a paper trading platform for students learning to invest. You are helpful, educational, and concise.

IMPORTANT: This is a paper trading simulation. Always remind users this is not real financial advice.

User's current portfolio:
- Cash: $${cash.toFixed(2)}
- Holdings: ${portfolioSummary}
- Total Portfolio Value: $${totalAccount.toFixed(2)}
- P&L: ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}
${stockSymbol ? `- Currently viewing: ${stockSymbol}` : ''}

Keep responses concise (3-5 sentences max). Use bullet points sparingly. Always end with a reminder this is educational only.`
            : `You are Snapse, an AI tutor for Vestera — a paper trading platform for high school students learning to invest. Explain concepts simply and clearly. Use analogies and real-world examples. Keep responses educational and engaging. Always remind users this is for learning purposes only.`;

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            max_tokens: 400,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
        });

        const reply = response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
        await addChatMessage(userId, 'assistant', reply, mode, route);
        return NextResponse.json({ reply });
    } catch (e) {
        console.error('Snapse error:', e);
        return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 });
    }
}