'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './trade.module.css';

interface TradeEntry {
    stock: string;
    action: string;
    shares: number;
    price: number;
    created_at: string;
}

interface HoldingEntry {
    stock: string;
    shares: number;
    current_price: number;
    value: number;
}

export default function TradingDashboard() {
    const [ticker, setTicker] = useState('AAPL');
    const [price, setPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [cash, setCash] = useState(0);
    const [holdings, setHoldings] = useState<HoldingEntry[]>([]);
    const [recentTrades, setRecentTrades] = useState<TradeEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [chartType, setChartType] = useState<'candlestick' | 'area' | 'line'>('area');
    const [timeframe, setTimeframe] = useState('1M');
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error'>('success');
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
    const seriesRef = useRef<unknown>(null);
    const router = useRouter();
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch price
    const fetchPrice = useCallback(async (sym: string) => {
        try {
            const res = await fetch(`/api/price/${sym}`);
            const data = await res.json();
            if (data.price) {
                setPriceChange(data.price - price);
                setPrice(data.price);
            }
        } catch { /* ignore */ }
    }, [price]);

    // Fetch holdings
    const fetchHoldings = useCallback(async () => {
        try {
            const res = await fetch('/api/holdings');
            if (res.status === 401) { router.push('/login'); return; }
            const data = await res.json();
            setCash(data.cash || 0);
            setHoldings(data.holdings || []);
        } catch { /* ignore */ }
    }, [router]);

    // Chart library modules ref
    const lcRef = useRef<typeof import('lightweight-charts') | null>(null);

    // Init chart
    useEffect(() => {
        let mounted = true;
        import('lightweight-charts').then((lc) => {
            if (!mounted || !chartRef.current) return;
            lcRef.current = lc;
            if (chartInstanceRef.current) chartInstanceRef.current.remove();

            const chart = lc.createChart(chartRef.current, {
                width: chartRef.current.clientWidth,
                height: 420,
                layout: { background: { type: lc.ColorType.Solid, color: 'transparent' }, textColor: '#94a3b8' },
                grid: { vertLines: { color: 'rgba(91,132,255,0.06)' }, horzLines: { color: 'rgba(91,132,255,0.06)' } },
                timeScale: { timeVisible: true, borderColor: 'rgba(91,132,255,0.1)' },
                rightPriceScale: { borderColor: 'rgba(91,132,255,0.1)' },
                crosshair: { mode: 0 },
            });
            chartInstanceRef.current = chart;
            const ro = new ResizeObserver(() => {
                if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
            });
            ro.observe(chartRef.current);
        });
        return () => { mounted = false; };
    }, []);

    // Update chart data when ticker or chartType changes — fetch REAL data
    useEffect(() => {
        if (!chartInstanceRef.current || !lcRef.current) return;
        const chart = chartInstanceRef.current;
        const lc = lcRef.current;

        // Remove old series
        if (seriesRef.current) {
            try { chart.removeSeries(seriesRef.current as Parameters<typeof chart.removeSeries>[0]); } catch { /* ignore */ }
            seriesRef.current = null;
        }

        const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;

        // Fetch real historical data
        fetch(`/api/history/${ticker}?days=${days}`)
            .then(res => res.json())
            .then(data => {
                if (!data.history || data.history.length === 0 || !chartInstanceRef.current) return;
                const bars = data.history as { date: string; open: number; high: number; low: number; close: number }[];

                if (chartType === 'candlestick') {
                    const series = chart.addSeries(lc.CandlestickSeries, {
                        upColor: '#22c55e', downColor: '#ef4444',
                        borderUpColor: '#22c55e', borderDownColor: '#ef4444',
                        wickUpColor: '#22c55e', wickDownColor: '#ef4444',
                    });
                    const chartData = bars.map(b => ({
                        time: b.date,
                        open: b.open,
                        high: b.high,
                        low: b.low,
                        close: b.close,
                    }));
                    series.setData(chartData as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                } else if (chartType === 'area') {
                    const series = chart.addSeries(lc.AreaSeries, {
                        topColor: 'rgba(91, 132, 255, 0.4)', bottomColor: 'rgba(91, 132, 255, 0.02)',
                        lineColor: '#5b84ff', lineWidth: 2,
                    });
                    const chartData = bars.map(b => ({
                        time: b.date,
                        value: b.close,
                    }));
                    series.setData(chartData as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                } else {
                    const series = chart.addSeries(lc.LineSeries, { color: '#a855f7', lineWidth: 2 });
                    const chartData = bars.map(b => ({
                        time: b.date,
                        value: b.close,
                    }));
                    series.setData(chartData as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                }

                chart.timeScale().fitContent();
            })
            .catch(e => console.error('Chart data error:', e));
    }, [ticker, chartType, timeframe]);

    // Fetch data on ticker change
    useEffect(() => {
        fetchPrice(ticker);
        fetchHoldings();
        if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
        priceIntervalRef.current = setInterval(() => fetchPrice(ticker), 30000);
        return () => { if (priceIntervalRef.current) clearInterval(priceIntervalRef.current); };
    }, [ticker, fetchPrice, fetchHoldings]);

    // Search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 1) { setSearchResults([]); setShowSearch(false); return; }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/search-stocks?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.results || []);
            setShowSearch(true);
        }, 200);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const selectStock = (sym: string) => {
        setTicker(sym);
        setSearchQuery('');
        setShowSearch(false);
        setPrice(0);
    };

    const executeTrade = async (action: 'BUY' | 'SELL') => {
        if (!price || quantity <= 0) return;
        setStatusMsg('');
        try {
            const res = await fetch('/api/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, quantity, price, action }),
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg(`✅ ${action} ${quantity} ${ticker} @ $${price.toFixed(2)}`);
                setStatusType('success');
                setCash(data.cash_after);
                fetchHoldings();
                setRecentTrades(prev => [{ stock: ticker, action, shares: quantity, price, created_at: new Date().toISOString() }, ...prev].slice(0, 10));
            } else {
                setStatusMsg(`❌ ${data.error}`);
                setStatusType('error');
            }
        } catch {
            setStatusMsg('❌ Trade failed');
            setStatusType('error');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const portfolioValue = holdings.reduce((s, h) => s + h.value, 0);

    return (
        <div className={styles.dashWrap}>
            {/* Dashboard navbar */}
            <nav className={styles.dashNav}>
                <Link href="/" className={styles.brand}>⚡ Vestera</Link>
                <div className={styles.navLinks}>
                    <Link href="/trade">📊 Trade</Link>
                    <Link href="/stats">📈 Stats</Link>
                    <Link href="/learn">📚 Learn</Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div className={styles.dashGrid}>
                {/* CHART AREA */}
                <div className={styles.chartPanel}>
                    <div className={styles.chartHeader}>
                        <div className={styles.tickerInfo}>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                                    placeholder="Search stock..."
                                    className={styles.searchInput}
                                />
                                {showSearch && searchResults.length > 0 && (
                                    <div className={styles.searchDropdown}>
                                        {searchResults.map(s => (
                                            <button key={s} onClick={() => selectStock(s)} className={styles.searchItem}>{s}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <h2>{ticker}</h2>
                            <span className={styles.priceDisplay}>
                                ${price.toFixed(2)}
                                <span className={priceChange >= 0 ? styles.up : styles.down}>
                                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}
                                </span>
                            </span>
                        </div>

                        <div className={styles.chartControls}>
                            <div className={styles.chartTypeGroup}>
                                {(['area', 'candlestick', 'line'] as const).map(ct => (
                                    <button key={ct} className={`${styles.ctrlBtn} ${chartType === ct ? styles.active : ''}`} onClick={() => setChartType(ct)}>
                                        {ct === 'area' ? '📈' : ct === 'candlestick' ? '🕯️' : '📉'} {ct.charAt(0).toUpperCase() + ct.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.chartTypeGroup}>
                                {['1W', '1M', '3M', '1Y'].map(tf => (
                                    <button key={tf} className={`${styles.ctrlBtn} ${timeframe === tf ? styles.active : ''}`} onClick={() => setTimeframe(tf)}>
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div ref={chartRef} className={styles.chartArea} />
                </div>

                {/* SIDEBAR */}
                <div className={styles.sidebar}>
                    {/* Portfolio summary */}
                    <div className={styles.sideCard}>
                        <h3>💼 Portfolio</h3>
                        <div className={styles.portfolioGrid}>
                            <div className={styles.portfolioItem}>
                                <span className={styles.itemLabel}>Cash</span>
                                <span className={styles.itemValue}>${cash.toFixed(2)}</span>
                            </div>
                            <div className={styles.portfolioItem}>
                                <span className={styles.itemLabel}>Holdings</span>
                                <span className={styles.itemValue}>${portfolioValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Buy/Sell panel */}
                    <div className={styles.sideCard}>
                        <h3>📊 Trade {ticker}</h3>
                        <div className={styles.tradeForm}>
                            <label className={styles.tradeLabel}>
                                Shares
                                <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className={styles.tradeInput} />
                            </label>
                            <div className={styles.tradeTotal}>
                                Total: <strong>${(quantity * price).toFixed(2)}</strong>
                            </div>
                            <div className={styles.tradeBtns}>
                                <button className={styles.buyBtn} onClick={() => executeTrade('BUY')}>BUY</button>
                                <button className={styles.sellBtn} onClick={() => executeTrade('SELL')}>SELL</button>
                            </div>
                            {statusMsg && (
                                <div className={`${styles.tradeStatus} ${statusType === 'success' ? styles.tradeSuccess : styles.tradeError}`}>
                                    {statusMsg}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Holdings */}
                    {holdings.length > 0 && (
                        <div className={styles.sideCard}>
                            <h3>📦 Holdings</h3>
                            <div className={styles.holdingsList}>
                                {holdings.map(h => (
                                    <div key={h.stock} className={styles.holdingRow} onClick={() => selectStock(h.stock)}>
                                        <span className={styles.holdingTicker}>{h.stock}</span>
                                        <span>{h.shares} shares</span>
                                        <span className={styles.holdingValue}>${h.value?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent trades */}
                    {recentTrades.length > 0 && (
                        <div className={styles.sideCard}>
                            <h3>🕐 Recent</h3>
                            <div className={styles.holdingsList}>
                                {recentTrades.slice(0, 5).map((t, i) => (
                                    <div key={i} className={styles.holdingRow}>
                                        <span className={t.action === 'BUY' ? styles.tradeBuy : styles.tradeSell}>{t.action}</span>
                                        <span>{t.shares} {t.stock}</span>
                                        <span className={styles.holdingValue}>${t.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
