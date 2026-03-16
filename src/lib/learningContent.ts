// Learning content data — ported from the Python app's routes.py
export interface LessonUnit {
    id: number;
    title: string;
    content: string;
    quiz: { question: string; options: string[]; answer: number }[];
}

export interface Level {
    id: string;
    name: string;
    emoji: string;
    color: string;
    units: LessonUnit[];
}

export const LEVELS: Level[] = [
    {
        id: 'beginner',
        name: 'Beginner',
        emoji: '🌱',
        color: '#22c55e',
        units: [
            {
                id: 1,
                title: 'What is the Stock Market?',
                content: `The stock market is where buyers and sellers trade shares of publicly listed companies. When you buy a stock, you're purchasing a tiny piece of ownership in that company.\n\n**Key Concepts:**\n- **Stocks (Shares):** Units of ownership in a company\n- **Exchange:** A marketplace where stocks are traded (e.g., NYSE, NASDAQ)\n- **Ticker Symbol:** A short code identifying a stock (e.g., AAPL for Apple)\n- **Market Hours:** US markets typically open 9:30 AM – 4:00 PM ET\n\n**Why do companies go public?**\nCompanies sell shares to raise money for growth, research, and expansion. In return, investors get a chance to profit if the company does well.`,
                quiz: [
                    { question: 'What does buying a stock represent?', options: ['A loan to the company', 'Partial ownership', 'A guarantee of profit', 'A bond'], answer: 1 },
                    { question: 'What is a ticker symbol?', options: ['A company logo', 'A short code for a stock', 'A stock price', 'A trading fee'], answer: 1 },
                ],
            },
            {
                id: 2,
                title: 'Understanding Stock Prices',
                content: `Stock prices are determined by supply and demand. When more people want to buy a stock than sell it, the price goes up. When more people want to sell, the price goes down.\n\n**What affects stock prices?**\n- Company earnings and revenue\n- Industry trends and competition\n- Economic conditions (interest rates, inflation)\n- News and market sentiment\n- Government regulations\n\n**Important price terms:**\n- **Bid:** The highest price a buyer is willing to pay\n- **Ask:** The lowest price a seller is willing to accept\n- **Spread:** The difference between bid and ask`,
                quiz: [
                    { question: 'What determines a stock price?', options: ['Government only', 'Supply and demand', 'The company CEO', 'Random chance'], answer: 1 },
                    { question: 'What is the "spread"?', options: ['Total shares traded', 'Difference between bid and ask', 'A trading fee', 'Company profit'], answer: 1 },
                ],
            },
            {
                id: 3,
                title: 'Types of Orders',
                content: `When trading stocks, you can place different types of orders:\n\n**Market Order:** Buy/sell immediately at the current price. Fast execution but price may vary.\n\n**Limit Order:** Buy/sell at a specific price or better. You control the price but it might not get filled.\n\n**Stop-Loss Order:** Automatically sells when the price drops to a certain level. Helps limit losses.\n\n**Stop-Limit Order:** Combines stop and limit orders. Triggers at a stop price, then becomes a limit order.`,
                quiz: [
                    { question: 'Which order type executes at the current market price?', options: ['Limit order', 'Stop-loss order', 'Market order', 'Stop-limit order'], answer: 2 },
                    { question: 'What does a stop-loss order do?', options: ['Buys more shares', 'Sells when price drops to a level', 'Guarantees profit', 'Cancels all orders'], answer: 1 },
                ],
            },
            {
                id: 4,
                title: 'What is a Portfolio?',
                content: `A portfolio is a collection of all your investments. Building a good portfolio is about balancing risk and reward.\n\n**Key portfolio concepts:**\n- **Diversification:** Don't put all your eggs in one basket\n- **Asset Allocation:** Mix of stocks, bonds, cash, etc.\n- **Rebalancing:** Periodically adjusting your portfolio\n- **Risk Tolerance:** How much loss you can handle\n\n**Common portfolio strategies:**\n- **Conservative:** More bonds, less stocks (lower risk)\n- **Moderate:** Balanced mix of stocks and bonds\n- **Aggressive:** More stocks, less bonds (higher risk, higher potential return)`,
                quiz: [
                    { question: 'What is diversification?', options: ['Buying one stock', 'Spreading investments across different assets', 'Only investing in bonds', 'Trading daily'], answer: 1 },
                    { question: 'An aggressive portfolio typically has:', options: ['More bonds', 'Only cash', 'More stocks', 'No investments'], answer: 2 },
                ],
            },
            {
                id: 5,
                title: 'Reading Stock Charts',
                content: `Stock charts display price movements over time. Learning to read them is essential for making informed decisions.\n\n**Types of charts:**\n- **Line Chart:** Simple line showing closing prices over time\n- **Bar Chart:** Shows open, high, low, and close (OHLC) for each period\n- **Candlestick Chart:** Similar to bar chart but more visual\n\n**Candlestick basics:**\n- **Green/White candle:** Price went UP (close > open)\n- **Red/Black candle:** Price went DOWN (close < open)\n- **Body:** The thick part showing open-to-close range\n- **Wicks/Shadows:** Thin lines showing high and low`,
                quiz: [
                    { question: 'What does a green candlestick mean?', options: ['Price went down', 'Price went up', 'Market is closed', 'Volume increased'], answer: 1 },
                    { question: 'What do the wicks on a candlestick show?', options: ['Trading volume', 'High and low prices', 'Number of trades', 'Market sentiment'], answer: 1 },
                ],
            },
            {
                id: 6,
                title: 'Bulls vs Bears',
                content: `The terms "bull" and "bear" describe market sentiment:\n\n**Bull Market:** Prices are rising or expected to rise. Optimism prevails.\n**Bear Market:** Prices are falling or expected to fall. Pessimism prevails.\n\n**Key facts:**\n- A bear market is typically defined as a 20%+ decline from recent highs\n- Bull markets tend to last longer than bear markets\n- Both are normal parts of market cycles`,
                quiz: [
                    { question: 'What defines a bear market?', options: ['5% decline', '10% decline', '20%+ decline', '50% decline'], answer: 2 },
                    { question: 'A bull market means:', options: ['Prices are falling', 'Prices are rising', 'Market is closed', 'No trading'], answer: 1 },
                ],
            },
            {
                id: 7,
                title: 'Dividends',
                content: `Dividends are payments made by companies to shareholders from their profits.\n\n**Key concepts:**\n- **Dividend Yield:** Annual dividend / stock price × 100\n- **Ex-Dividend Date:** Must own stock before this date to receive dividend\n- **DRIP:** Dividend Reinvestment Plan — automatically reinvest dividends\n\nNot all companies pay dividends. Growth companies often reinvest profits instead.`,
                quiz: [
                    { question: 'What is a dividend?', options: ['A stock split', 'Payment from company profits', 'A trading fee', 'A type of stock'], answer: 1 },
                    { question: 'What does DRIP stand for?', options: ['Daily Return Investment Plan', 'Dividend Reinvestment Plan', 'Direct Return Investment Program', 'Dividend Rate Index Plan'], answer: 1 },
                ],
            },
            {
                id: 8,
                title: 'Market Indices',
                content: `Market indices track the performance of a group of stocks:\n\n**Major US Indices:**\n- **S&P 500:** 500 largest US companies (broad market gauge)\n- **Dow Jones (DJIA):** 30 large "blue chip" companies\n- **NASDAQ Composite:** Tech-heavy index, ~3000 stocks\n- **Russell 2000:** 2000 small-cap companies\n\nIndices help investors understand overall market direction.`,
                quiz: [
                    { question: 'How many companies are in the S&P 500?', options: ['100', '250', '500', '1000'], answer: 2 },
                    { question: 'Which index is tech-heavy?', options: ['Dow Jones', 'S&P 500', 'NASDAQ', 'Russell 2000'], answer: 2 },
                ],
            },
            {
                id: 9,
                title: 'Risk Management Basics',
                content: `Managing risk is crucial for long-term investing success.\n\n**Key principles:**\n- Never invest more than you can afford to lose\n- Diversify across sectors and asset classes\n- Use stop-loss orders to limit downside\n- Don't invest based on emotions\n\n**The 1% Rule:** Never risk more than 1% of your portfolio on a single trade.\n\n**Position Sizing:** Determine how many shares to buy based on your risk tolerance and stop-loss level.`,
                quiz: [
                    { question: 'What is the 1% rule?', options: ['Invest 1% of income', 'Never risk more than 1% per trade', 'Only buy 1 stock', 'Trade once per day'], answer: 1 },
                    { question: 'What helps limit losses?', options: ['Buying more shares', 'Stop-loss orders', 'Ignoring the market', 'Only buying penny stocks'], answer: 1 },
                ],
            },
            {
                id: 10,
                title: 'Getting Started with Paper Trading',
                content: `Paper trading lets you practice trading without risking real money.\n\n**Benefits:**\n- Learn how markets work risk-free\n- Test trading strategies\n- Build confidence before investing real money\n- Understand order types and execution\n\n**Tips for paper trading:**\n1. Treat it like real money\n2. Keep a trading journal\n3. Set realistic goals\n4. Practice risk management\n5. Review your trades regularly`,
                quiz: [
                    { question: 'What is paper trading?', options: ['Trading paper products', 'Simulated trading without real money', 'Only trading penny stocks', 'Writing about stocks'], answer: 1 },
                    { question: 'Why is paper trading useful?', options: ['Guaranteed profits', 'Risk-free practice', 'It uses real money', 'It only works for bonds'], answer: 1 },
                ],
            },
        ],
    },
    {
        id: 'intermediate',
        name: 'Intermediate',
        emoji: '📈',
        color: '#5b84ff',
        units: [
            { id: 1, title: 'Technical Analysis Fundamentals', content: 'Technical analysis studies price patterns and trends to predict future movements.\n\n**Key Concepts:**\n- **Support:** Price level where buying pressure prevents further decline\n- **Resistance:** Price level where selling pressure prevents further rise\n- **Trend Lines:** Lines connecting highs or lows to show direction\n- **Volume:** Number of shares traded — confirms price movements\n\n**The three assumptions:**\n1. Market action discounts everything\n2. Prices move in trends\n3. History tends to repeat itself', quiz: [{ question: 'What is a support level?', options: ['Where price stops rising', 'Where buying prevents decline', 'Company headquarters', 'A trading fee'], answer: 1 }, { question: 'What does volume confirm?', options: ['Company profits', 'Price movements', 'Dividend payments', 'Market hours'], answer: 1 }] },
            { id: 2, title: 'Moving Averages', content: 'Moving averages smooth out price data to identify trends.\n\n**Types:**\n- **SMA (Simple):** Average of closing prices over N periods\n- **EMA (Exponential):** Weights recent prices more heavily\n\n**Common periods:** 20-day, 50-day, 200-day\n\n**Golden Cross:** 50-day MA crosses above 200-day MA (bullish)\n**Death Cross:** 50-day MA crosses below 200-day MA (bearish)', quiz: [{ question: 'What is a Golden Cross?', options: ['50-day crosses above 200-day', '200-day crosses above 50-day', 'Price hits all-time high', 'Volume doubles'], answer: 0 }, { question: 'EMA gives more weight to:', options: ['Oldest prices', 'Recent prices', 'Volume', 'All prices equally'], answer: 1 }] },
            { id: 3, title: 'Fundamental Analysis', content: 'Fundamental analysis evaluates a company\'s financial health.\n\n**Key Metrics:**\n- **P/E Ratio:** Price / Earnings per share. Lower may indicate undervalued.\n- **Revenue:** Total sales\n- **EPS:** Earnings per share\n- **Debt-to-Equity:** Total debt / shareholders\' equity\n- **ROE:** Return on equity\n\n**Where to find data:** 10-K (annual report), 10-Q (quarterly), earnings calls', quiz: [{ question: 'A low P/E ratio may suggest:', options: ['Overvalued stock', 'Undervalued or slow growth', 'High debt', 'High dividends'], answer: 1 }, { question: 'What is EPS?', options: ['Earnings per stock', 'Earnings per share', 'Exchange price standard', 'Equity per shareholder'], answer: 1 }] },
            { id: 4, title: 'Candlestick Patterns', content: 'Common patterns that signal potential reversals or continuations:\n\n**Bullish Patterns:**\n- **Hammer:** Small body at top, long lower wick\n- **Engulfing:** Large green candle engulfs previous red candle\n- **Morning Star:** Three-candle reversal pattern\n\n**Bearish Patterns:**\n- **Shooting Star:** Small body at bottom, long upper wick\n- **Bearish Engulfing:** Large red candle engulfs previous green\n- **Evening Star:** Three-candle reversal pattern\n\nConfirm patterns with volume!', quiz: [{ question: 'A hammer candlestick is:', options: ['Bearish', 'Bullish', 'Neutral', 'Only for crypto'], answer: 1 }, { question: 'Patterns should be confirmed with:', options: ['News articles', 'Volume', 'Social media', 'Gut feeling'], answer: 1 }] },
            { id: 5, title: 'Sector Analysis', content: 'The stock market is divided into 11 sectors:\n\n1. Technology\n2. Healthcare\n3. Financials\n4. Consumer Discretionary\n5. Communication Services\n6. Industrials\n7. Consumer Staples\n8. Energy\n9. Utilities\n10. Real Estate\n11. Materials\n\n**Sector Rotation:** Money flows between sectors based on economic cycles.', quiz: [{ question: 'How many market sectors are there?', options: ['5', '8', '11', '15'], answer: 2 }, { question: 'What is sector rotation?', options: ['Changing company names', 'Money flowing between sectors', 'Merging sectors', 'Creating new sectors'], answer: 1 }] },
            { id: 6, title: 'Options Basics', content: 'Stock options give you the right (not obligation) to buy or sell at a specific price.\n\n**Call Option:** Right to BUY at a set price (strike price)\n**Put Option:** Right to SELL at a set price\n\n**Key terms:**\n- **Strike Price:** The agreed-upon price\n- **Expiration Date:** When the option expires\n- **Premium:** The price you pay for the option\n- **In the Money (ITM):** Option has intrinsic value\n- **Out of the Money (OTM):** No intrinsic value yet', quiz: [{ question: 'A call option gives you the right to:', options: ['Sell', 'Buy', 'Hold', 'Short'], answer: 1 }, { question: 'What is the premium?', options: ['The strike price', 'The cost of the option', 'The expiration date', 'The stock price'], answer: 1 }] },
            { id: 7, title: 'ETFs and Mutual Funds', content: 'Pooled investment vehicles that hold multiple assets.\n\n**ETFs:**\n- Trade like stocks on exchanges\n- Lower expense ratios\n- Tax-efficient\n- Examples: SPY (S&P 500), QQQ (NASDAQ)\n\n**Mutual Funds:**\n- Priced once daily after market close\n- Actively or passively managed\n- May have minimum investments\n\n**Index Funds:** Track a specific index (cheapest option)', quiz: [{ question: 'ETFs trade:', options: ['Once daily', 'Like stocks throughout the day', 'Only on weekends', 'Only at market close'], answer: 1 }, { question: 'SPY tracks which index?', options: ['Dow Jones', 'NASDAQ', 'S&P 500', 'Russell 2000'], answer: 2 }] },
            { id: 8, title: 'Position Sizing', content: 'Determine how many shares to buy based on risk.\n\n**Formula:**\nPosition Size = (Account × Risk %) / (Entry - Stop Loss)\n\n**Example:**\n- Account: $10,000\n- Risk per trade: 1% = $100\n- Entry: $50, Stop Loss: $48\n- Risk per share: $2\n- Position Size: $100 / $2 = 50 shares\n\nNever risk more than 1-2% of your account per trade!', quiz: [{ question: 'With $10K account, 1% risk, and $2 risk per share, position size is:', options: ['25 shares', '50 shares', '100 shares', '200 shares'], answer: 1 }, { question: 'Max recommended risk per trade is:', options: ['5-10%', '3-5%', '1-2%', '10-20%'], answer: 2 }] },
            { id: 9, title: 'Market Psychology', content: 'Emotions are the biggest enemy of successful trading.\n\n**Common psychological traps:**\n- **FOMO:** Fear of missing out — buying at tops\n- **Revenge Trading:** Trying to win back losses quickly\n- **Confirmation Bias:** Only seeing data that supports your view\n- **Anchoring:** Fixating on a specific price point\n\n**Solutions:**\n1. Have a written trading plan\n2. Use stop-losses religiously\n3. Take breaks after losses\n4. Journal every trade', quiz: [{ question: 'What is FOMO?', options: ['A chart pattern', 'Fear of missing out', 'A type of order', 'A market index'], answer: 1 }, { question: 'The best defense against emotional trading is:', options: ['More trades', 'Written trading plan', 'Following social media', 'Larger positions'], answer: 1 }] },
            { id: 10, title: 'Earnings Reports', content: 'Quarterly earnings reports are major catalysts for stock prices.\n\n**Key things to watch:**\n- **Revenue vs Expectations:** Did the company beat or miss?\n- **EPS vs Expectations:** Earnings per share compared to analyst estimates\n- **Guidance:** Company\'s outlook for next quarter/year\n- **Cash Flow:** How much cash the business generates\n\n**Earnings Season:** Reports cluster in Jan, Apr, Jul, Oct\n\n**Tip:** Price often moves BEFORE and AFTER the report. The reaction to the report matters more than the numbers themselves.', quiz: [{ question: 'Earnings season occurs how many times per year?', options: ['1', '2', '4', '12'], answer: 2 }, { question: 'What often matters more than the earnings numbers?', options: ['The CEO name', 'The market reaction', 'The company logo', 'The ticker symbol'], answer: 1 }] },
        ],
    },
    {
        id: 'advanced',
        name: 'Advanced',
        emoji: '🏆',
        color: '#a855f7',
        units: [
            { id: 1, title: 'Advanced Technical Indicators', content: 'Beyond basic indicators, advanced traders use:\n\n**RSI (Relative Strength Index):**\n- Measures momentum (0-100)\n- Above 70 = overbought, Below 30 = oversold\n\n**MACD:**\n- Shows trend direction and momentum\n- Signal line crossovers indicate buy/sell\n\n**Bollinger Bands:**\n- Price typically stays within 2 standard deviations of a moving average\n- Squeeze = low volatility, potential breakout\n\n**Fibonacci Retracements:**\n- Key levels: 23.6%, 38.2%, 50%, 61.8%\n- Used to identify support/resistance during pullbacks', quiz: [{ question: 'RSI above 70 suggests:', options: ['Oversold', 'Overbought', 'Neutral', 'Low volume'], answer: 1 }, { question: 'A Bollinger Band squeeze suggests:', options: ['High volatility', 'Low volatility, potential breakout', 'Market crash', 'Dividend payment'], answer: 1 }] },
            { id: 2, title: 'Options Strategies', content: 'Advanced options strategies for different market conditions:\n\n**Covered Call:** Own stock + sell call. Income strategy.\n**Protective Put:** Own stock + buy put. Insurance strategy.\n**Iron Condor:** Sell OTM call spread + put spread. Profit from low volatility.\n**Straddle:** Buy call + put at same strike. Profit from big moves either way.\n**Vertical Spread:** Buy and sell options at different strikes, same expiration.\n\n**Greeks:**\n- Delta: Price sensitivity\n- Theta: Time decay\n- Vega: Volatility sensitivity\n- Gamma: Rate of delta change', quiz: [{ question: 'A covered call is:', options: ['Buying calls', 'Owning stock + selling call', 'Only puts', 'Shorting stock'], answer: 1 }, { question: 'Theta measures:', options: ['Price sensitivity', 'Time decay', 'Volatility', 'Volume'], answer: 1 }] },
            { id: 3, title: 'Short Selling', content: 'Short selling lets you profit from declining prices.\n\n**How it works:**\n1. Borrow shares from your broker\n2. Sell the borrowed shares\n3. Buy them back later at a lower price\n4. Return the shares and keep the difference\n\n**Risks:**\n- Unlimited loss potential (price can rise infinitely)\n- Short squeeze: rapid price rise forces shorts to cover\n- Margin requirements and interest costs\n\n**Short Interest:** Percentage of shares sold short. High short interest = potential squeeze.', quiz: [{ question: 'Short selling profits when:', options: ['Price goes up', 'Price goes down', 'Price stays the same', 'Volume increases'], answer: 1 }, { question: 'The maximum loss on a short sale is:', options: ['100%', '50%', 'Theoretically unlimited', 'The stock price'], answer: 2 }] },
            { id: 4, title: 'Algorithmic Trading', content: 'Using algorithms and code to automate trading decisions.\n\n**Common strategies:**\n- **Mean Reversion:** Price returns to average\n- **Momentum:** Follow the trend\n- **Arbitrage:** Exploit price differences\n- **Market Making:** Provide liquidity, profit from spread\n\n**Tools:** Python, R, APIs, backtesting frameworks\n\n**Key concerns:**\n- Overfitting: Strategy works on historical data but not live\n- Latency: Speed matters in execution\n- Risk management: Automated doesn\'t mean risk-free', quiz: [{ question: 'Mean reversion strategies assume price will:', options: ['Always go up', 'Return to its average', 'Go to zero', 'Stay the same'], answer: 1 }, { question: 'Overfitting means:', options: ['Too much data', 'Strategy works on past but not future data', 'Trading too fast', 'High fees'], answer: 1 }] },
            { id: 5, title: 'Portfolio Theory', content: 'Modern Portfolio Theory (MPT) by Harry Markowitz:\n\n**Key concepts:**\n- **Efficient Frontier:** Optimal portfolios offering highest return for given risk\n- **Correlation:** How assets move relative to each other (-1 to +1)\n- **Sharpe Ratio:** (Return - Risk-free) / Std Dev. Higher = better risk-adjusted returns\n- **Beta:** Volatility relative to the market. Beta > 1 = more volatile\n- **Alpha:** Excess return above a benchmark\n\n**Diversification works because:** Uncorrelated assets reduce overall portfolio risk.', quiz: [{ question: 'The Sharpe Ratio measures:', options: ['Total return', 'Risk-adjusted return', 'Dividend yield', 'Market cap'], answer: 1 }, { question: 'Beta > 1 means:', options: ['Less volatile than market', 'More volatile than market', 'No correlation', 'Guaranteed profit'], answer: 1 }] },
            { id: 6, title: 'Macroeconomics & Markets', content: 'Key economic indicators that move markets:\n\n**Federal Reserve:**\n- Sets interest rates (Federal Funds Rate)\n- Higher rates = stocks down, bonds up (generally)\n- Quantitative Easing (QE) = injecting money\n\n**Key Indicators:**\n- **GDP:** Economic growth\n- **CPI/PPI:** Inflation measures\n- **Unemployment Rate:** Labor market health\n- **PMI:** Manufacturing/services activity\n\n**Yield Curve:** Difference between long and short-term bond rates. Inverted curve = recession signal.', quiz: [{ question: 'Higher interest rates typically cause stocks to:', options: ['Rise', 'Fall', 'Stay the same', 'Trade at higher volume'], answer: 1 }, { question: 'An inverted yield curve signals:', options: ['Bull market', 'Potential recession', 'High inflation', 'Low unemployment'], answer: 1 }] },
            { id: 7, title: 'International Markets', content: 'Trading beyond US borders.\n\n**Major Global Exchanges:**\n- **LSE:** London Stock Exchange\n- **TSE:** Tokyo Stock Exchange\n- **SSE:** Shanghai Stock Exchange\n- **HKEX:** Hong Kong\n- **Euronext:** Amsterdam, Paris, Lisbon\n\n**ADRs:** American Depositary Receipts let you buy foreign stocks on US exchanges.\n\n**Currency Risk:** Exchange rate fluctuations impact returns on international investments.\n\n**Emerging Markets:** Higher growth potential but more political and economic risk.', quiz: [{ question: 'ADRs allow you to:', options: ['Trade futures', 'Buy foreign stocks on US exchanges', 'Avoid taxes', 'Short sell only'], answer: 1 }, { question: 'Currency risk affects:', options: ['Only domestic stocks', 'Only bonds', 'International investments', 'Only ETFs'], answer: 2 }] },
            { id: 8, title: 'Risk Metrics & Analysis', content: 'Advanced risk measurement tools:\n\n**Value at Risk (VaR):**\n- Maximum expected loss over a time period at a confidence level\n- Example: 95% VaR of $10K means 5% chance of losing more than $10K\n\n**Maximum Drawdown:**\n- Largest peak-to-trough decline in portfolio value\n- Important for assessing worst-case scenarios\n\n**Sortino Ratio:** Like Sharpe but only considers downside volatility.\n\n**Kelly Criterion:** Optimal position size based on win rate and payoff ratio.\nf* = (bp - q) / b where b=payoff, p=win prob, q=loss prob', quiz: [{ question: '95% VaR means:', options: ['95% chance of profit', '5% chance of exceeding the loss amount', '95% of capital is at risk', 'Only 5% is invested'], answer: 1 }, { question: 'Maximum drawdown measures:', options: ['Total profit', 'Largest peak-to-trough decline', 'Daily returns', 'Trading volume'], answer: 1 }] },
            { id: 9, title: 'Behavioral Finance', content: 'How cognitive biases affect financial decisions:\n\n**Key Biases:**\n- **Loss Aversion:** Losses feel 2x worse than equivalent gains feel good\n- **Herding:** Following the crowd instead of your analysis\n- **Overconfidence:** Overestimating your ability to predict markets\n- **Recency Bias:** Overweighting recent events\n- **Sunk Cost Fallacy:** Holding losers because you already invested\n\n**Prospect Theory (Kahneman & Tversky):**\nPeople evaluate gains and losses relative to a reference point, and are risk-averse for gains but risk-seeking for losses.', quiz: [{ question: 'Loss aversion means:', options: ['Avoiding all risk', 'Losses feel worse than equal gains feel good', 'Never selling stocks', 'Only buying bonds'], answer: 1 }, { question: 'The sunk cost fallacy leads to:', options: ['Taking profits quickly', 'Holding losers too long', 'Diversifying more', 'Buying index funds'], answer: 1 }] },
            { id: 10, title: 'Building a Trading System', content: 'Creating a complete, systematic approach to trading:\n\n**Components:**\n1. **Market Selection:** Which markets/stocks to trade\n2. **Entry Rules:** Specific conditions to open a position\n3. **Exit Rules:** When to take profit and cut losses\n4. **Position Sizing:** How much to risk per trade\n5. **Risk Management:** Maximum drawdown, daily loss limits\n\n**Backtesting:** Test your system on historical data before risking real money.\n\n**Forward Testing:** Paper trade your system for 1-3 months.\n\n**Key Metrics:**\n- Win rate, average win/loss, profit factor, maximum drawdown\n\n**Remember:** The best system is one you can follow consistently.', quiz: [{ question: 'Backtesting involves:', options: ['Trading with real money first', 'Testing on historical data', 'Buying after hours', 'Asking for advice'], answer: 1 }, { question: 'A complete trading system includes:', options: ['Only entry rules', 'Only exit rules', 'Entry, exit, position sizing, and risk management', 'Just following the news'], answer: 2 }] },
        ],
    },
];
