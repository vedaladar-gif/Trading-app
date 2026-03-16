import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { addChatMessage } from '@/lib/models';
import { getCurrentPrice, STOCKS } from '@/lib/stocks';

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
    const lessonContext = data.lessonContext || {};
    const stockSymbol = data.stockSymbol || '';

    if (!userMessage) {
        return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    await addChatMessage(userId, 'user', userMessage, mode, route);

    let reply: string;
    if (mode === 'TRADING') {
        reply = await handleTradingMode(userMessage, stockSymbol);
    } else if (mode === 'TUTOR') {
        reply = handleTutorMode(userMessage, lessonContext);
    } else {
        reply = "I'm not sure what mode we're in. Please try again.";
    }

    await addChatMessage(userId, 'assistant', reply, mode, route);
    return NextResponse.json({ reply });
}

async function handleTradingMode(message: string, stockSymbol: string): Promise<string> {
    if (!stockSymbol) {
        const found = STOCKS.map(s => s.replace('-USD', '')).find(s => message.toUpperCase().includes(s));
        if (found) stockSymbol = found;
    }

    if (!stockSymbol) {
        return `📊 **Trading Assistant Mode**\n\nTell me which stock you'd like to discuss (e.g., 'AAPL', 'NVDA', 'TSLA') and I'll give you a market analysis.\n\nYou could ask:\n- 'Should I buy AAPL?'\n- 'What's happening with NVDA?'\n- 'Is now a good time to enter the market?'\n- 'Explain diversification'\n\n*Educational simulation — not financial advice.*`;
    }

    let price: number;
    try { price = await getCurrentPrice(stockSymbol); } catch { price = 100; }

    let signal = 'HOLD', confidence = 55, reasoning = `Analysis of ${stockSymbol}:`;
    const lower = message.toLowerCase();
    if (lower.includes('buy')) { signal = 'HOLD'; confidence = 45; reasoning = `Before buying ${stockSymbol}, consider:`; }
    else if (lower.includes('sell')) { signal = 'HOLD'; confidence = 50; reasoning = `Selling requires careful timing. For ${stockSymbol}:`; }
    else if (lower.includes('risk')) { signal = 'EDUCATIONAL'; confidence = 100; reasoning = `Risk management for ${stockSymbol}:`; }

    return `🎯 **${stockSymbol} Analysis**\n\n**Current Price:** $${price.toFixed(2)}\n\n**${reasoning}**\n• Monitor recent earnings reports\n• Watch sector trends\n• Assess your risk tolerance\n• Consider your time horizon\n\n**Educational Signal:** ${signal} (Confidence: ${confidence}%)\n\n**Questions to ask yourself:**\n• What's your investment time horizon (days, months, years)?\n• How much can you afford to lose?\n• Does this fit your overall strategy?\n\n⚠️ *This is an educational simulation — not financial advice. Always do your own research before investing.*`;
}

function handleTutorMode(message: string, lessonContext: { title?: string; content?: string }): string {
    const lessonTitle = lessonContext.title || 'General Finance';
    const lower = message.toLowerCase();

    if (lower.includes('help') || lower.includes('explain')) {
        return `📚 **Tutor Mode: ${lessonTitle}**\n\nI can help you understand this lesson in different ways:\n\n**Ask me to:**\n• 'Explain this simply'\n• 'Give me an example'\n• 'What's a common mistake?'\n• 'Quiz me on this'\n\nWhat would help most?`;
    }
    if (lower.includes('simple') || lower.includes('like i')) {
        return `✨ **Simple Explanation**\n\nThink of ${lessonTitle} like this:\n• It's a tool investors use to make decisions\n• The key is understanding how it works\n• Practice with small examples first\n\n**Real-world example:**\nImagine you're deciding where to eat. You'd check reviews (similar to analyzing stocks). High ratings suggest a good choice, but you still need to try it yourself.\n\nDoes that make sense?`;
    }
    if (lower.includes('example')) {
        return `💡 **Example: ${lessonTitle}**\n\nLet's look at a real scenario:\n• Company: Apple Inc. (AAPL)\n• Stock price: $170\n• Earnings: $6 per share\n• P/E ratio: 170 ÷ 6 = ~28\n\n**What this tells us:**\nInvestors pay $28 for every $1 of earnings. Higher = more expensive.\n\nWant to explore another example?`;
    }
    if (lower.includes('mistake') || lower.includes('common')) {
        return `⚠️ **Common Misconceptions**\n\n❌ **Myth:** Higher stock price = better investment\n✅ **Truth:** Need to check valuation metrics like P/E ratio\n\n❌ **Myth:** Past performance guarantees future results\n✅ **Truth:** Markets are unpredictable; do your research\n\n❌ **Myth:** Day trading beats long-term investing\n✅ **Truth:** Most day traders underperform; consistency wins\n\nAny of these confusing?`;
    }
    if (lower.includes('quiz')) {
        return `🎯 **Quick Practice Question**\n\n**Q: What does a P/E ratio of 20 mean?**\nA) Investors pay $20 for every $1 of earnings\nB) The company made $20 per share\nC) Stock price will go up 20%\n\nTake a guess! (Reply with A, B, or C)`;
    }

    return `📖 **Learning: ${lessonTitle}**\n\nI'm here to help! You can:\n• Ask me to explain concepts simply\n• Request real-world examples\n• Ask about common mistakes\n• Let me quiz you\n\nWhat would you like to focus on?`;
}
