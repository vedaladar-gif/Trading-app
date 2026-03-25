'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './trade.module.css';
import VLogo from '@/components/VLogo';

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

const getMarketStatus = () => {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = et.getDay();
    const hours = et.getHours();
    const minutes = et.getMinutes();
    const time = hours * 60 + minutes;
    if (day === 0 || day === 6) return { open: false, label: 'Market Closed', sub: 'Opens Monday 9:30 AM ET' };
    if (time < 570) return { open: false, label: 'Market Closed', sub: 'Opens at 9:30 AM ET' };
    if (time >= 570 && time < 960) return { open: true, label: 'Market Open', sub: 'Closes at 4:00 PM ET' };
    return { open: false, label: 'Market Closed', sub: 'Opens tomorrow 9:30 AM ET' };
};

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
    const [chartReady, setChartReady] = useState(false);
    // auth gate — data fetches only start once session is confirmed
    const [authChecked, setAuthChecked] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
    const seriesRef = useRef<unknown>(null);
    // Ref tracks previous price so fetchPrice doesn't need `price` in its deps
    // (avoids the re-render loop: price change → fetchPrice recreated → effect re-fires)
    const prevPriceRef = useRef(0);
    const router = useRouter();
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const marketStatus = getMarketStatus();

    // ── 1. Auth gate — runs once on mount, before any data fetch ──────────────
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (!data.authenticated) {
                    router.replace('/login');
                } else {
                    setAuthChecked(true);
                }
            })
            .catch(() => router.replace('/login'));
    // router is stable from useRouter(), safe to omit from exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 2. Prefill ticker from ?ticker= URL param ──────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('ticker');
        if (t) setTicker(t.toUpperCase());
    }, []);

    // ── 3. Stable fetchPrice — no `price` in deps, uses ref for change calc ───
    const fetchPrice = useCallback(async (sym: string) => {
        try {
            const res = await fetch(`/api/price/${sym}`);
            const data = await res.json();
            if (data.price) {
                setPriceChange(data.price - prevPriceRef.current);
                prevPriceRef.current = data.price;
                setPrice(data.price);
            }
        } catch { /* ignore */ }
    }, []); // stable — no deps

    // ── 4. Stable fetchHoldings — auth decisions handled by the gate above ────
    const fetchHoldings = useCallback(async () => {
        try {
            const res = await fetch('/api/holdings');
            if (!res.ok) return; // silently skip; session expiry handled separately
            const data = await res.json();
            setCash(data.cash || 0);
            setHoldings(data.holdings || []);
        } catch { /* ignore */ }
    }, []); // stable — no deps

    const lcRef = useRef<typeof import('lightweight-charts') | null>(null);

    // Init chart
    useEffect(() => {
        let mounted = true;
        const initChart = async () => {
            // Wait for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!mounted || !chartRef.current) return;

            const lc = await import('lightweight-charts');
            if (!mounted || !chartRef.current) return;

            lcRef.current = lc;
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }

            const chart = lc.createChart(chartRef.current, {
                width: chartRef.current.clientWidth,
                height: chartRef.current.clientHeight || 460,
                layout: {
                    background: { type: lc.ColorType.Solid, color: 'transparent' },
                    textColor: '#4b5563',
                },
                grid: {
                    vertLines: { color: 'rgba(255,255,255,0.03)' },
                    horzLines: { color: 'rgba(255,255,255,0.03)' },
                },
                timeScale: {
                    timeVisible: true,
                    borderColor: 'rgba(255,255,255,0.05)',
                },
                rightPriceScale: {
                    borderColor: 'rgba(255,255,255,0.05)',
                },
                crosshair: { mode: 0 },
            });

            chartInstanceRef.current = chart;

            const ro = new ResizeObserver(() => {
                if (chartRef.current && chartInstanceRef.current) {
                    chartInstanceRef.current.applyOptions({ width: chartRef.current.clientWidth });
                }
            });
            ro.observe(chartRef.current);
            setChartReady(true);
        };

        initChart();
        return () => { mounted = false; };
    }, []);

    // Load chart data
    useEffect(() => {
        if (!chartReady || !chartInstanceRef.current || !lcRef.current) return;
        const chart = chartInstanceRef.current;
        const lc = lcRef.current;

        if (seriesRef.current) {
            try { chart.removeSeries(seriesRef.current as Parameters<typeof chart.removeSeries>[0]); } catch { /* ignore */ }
            seriesRef.current = null;
        }

        const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;

        fetch(`/api/history/${ticker}?days=${days}`)
            .then(res => res.json())
            .then(data => {
                if (!data.history || data.history.length === 0 || !chartInstanceRef.current) return;
                const bars = data.history as { date: string; open: number; high: number; low: number; close: number }[];

                if (chartType === 'candlestick') {
                    const series = chart.addSeries(lc.CandlestickSeries, {
                        upColor: '#4ade80', downColor: '#f87171',
                        borderUpColor: '#4ade80', borderDownColor: '#f87171',
                        wickUpColor: '#4ade80', wickDownColor: '#f87171',
                    });
                    series.setData(bars.map(b => ({
                        time: b.date, open: b.open, high: b.high, low: b.low, close: b.close,
                    })) as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                } else if (chartType === 'area') {
                    const series = chart.addSeries(lc.AreaSeries, {
                        topColor: 'rgba(79,110,247,0.3)',
                        bottomColor: 'rgba(79,110,247,0.02)',
                        lineColor: '#4f6ef7',
                        lineWidth: 2,
                    });
                    series.setData(bars.map(b => ({
                        time: b.date, value: b.close,
                    })) as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                } else {
                    const series = chart.addSeries(lc.LineSeries, {
                        color: '#9b5de5', lineWidth: 2,
                    });
                    series.setData(bars.map(b => ({
                        time: b.date, value: b.close,
                    })) as Parameters<typeof series.setData>[0]);
                    seriesRef.current = series;
                }

                chart.timeScale().fitContent();
            })
            .catch(e => console.error('Chart data error:', e));
    }, [ticker, chartType, timeframe, chartReady]);

    // ── 5. Data fetch — only runs after auth is confirmed ─────────────────────
    useEffect(() => {
        if (!authChecked) return;
        fetchPrice(ticker);
        fetchHoldings();
        if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
        priceIntervalRef.current = setInterval(() => fetchPrice(ticker), 30000);
        return () => { if (priceIntervalRef.current) clearInterval(priceIntervalRef.current); };
    }, [authChecked, ticker, fetchPrice, fetchHoldings]);

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
                setStatusMsg(`${action} ${quantity} ${ticker} @ $${price.toFixed(2)}`);
                setStatusType('success');
                setCash(data.cash_after);
                fetchHoldings();
                setRecentTrades(prev => [{
                    stock: ticker, action, shares: quantity, price,
                    created_at: new Date().toISOString()
                }, ...prev].slice(0, 10));
            } else {
                setStatusMsg(data.error);
                setStatusType('error');
            }
        } catch {
            setStatusMsg('Trade failed');
            setStatusType('error');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const portfolioValue = holdings.reduce((s, h) => s + h.value, 0);

    // Show spinner while session check is in flight (prevents premature redirects)
    if (!authChecked) {
        return (
            <div style={{
                minHeight: '100vh', background: '#060810',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: 32, height: 32,
                    border: '2px solid rgba(79,110,247,0.15)',
                    borderTopColor: '#4f6ef7',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    return (
        <div className={styles.dashWrap}>
            <nav className={styles.dashNav}>
                <Link href="/" className={styles.brand}>
                    <VLogo size={30} />
                    Vestera
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/trade">Trade</Link>
                    <Link href="/stats">Stats</Link>
                    <Link href="/learn">Learn</Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div className={styles.dashGrid}>
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
                            {/* Market status badge */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: marketStatus.open ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                                border: `1px solid ${marketStatus.open ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                                borderRadius: '100px', padding: '4px 12px',
                            }}>
                                <div style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: marketStatus.open ? '#4ade80' : '#f87171',
                                }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: marketStatus.open ? '#4ade80' : '#f87171' }}>
                                    {marketStatus.label}
                                </span>
                                <span style={{ fontSize: '11px', color: '#374151' }}>· {marketStatus.sub}</span>
                            </div>
                        </div>

                        <div className={styles.chartControls}>
                            <div className={styles.chartTypeGroup}>
                                {(['area', 'candlestick', 'line'] as const).map(ct => (
                                    <button
                                        key={ct}
                                        className={`${styles.ctrlBtn} ${chartType === ct ? styles.active : ''}`}
                                        onClick={() => setChartType(ct)}
                                    >
                                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.chartTypeGroup}>
                                {['1W', '1M', '3M', '1Y'].map(tf => (
                                    <button
                                        key={tf}
                                        className={`${styles.ctrlBtn} ${timeframe === tf ? styles.active : ''}`}
                                        onClick={() => setTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div ref={chartRef} className={styles.chartArea} />
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <h3>Portfolio</h3>
                        <div className={styles.portfolioGrid}>
                            <div className={styles.portfolioItem}>
                                <span className={styles.itemLabel}>Cash</span>
                                <span className={styles.itemValue}>${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={styles.portfolioItem}>
                                <span className={styles.itemLabel}>Holdings</span>
                                <span className={styles.itemValue}>${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideCard}>
                        <h3>Trade {ticker}</h3>
                        <div className={styles.tradeForm}>
                            <label className={styles.tradeLabel}>
                                Shares
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                    className={styles.tradeInput}
                                />
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

                    {holdings.length > 0 && (
                        <div className={styles.sideCard}>
                            <h3>Holdings</h3>
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

                    {recentTrades.length > 0 && (
                        <div className={styles.sideCard}>
                            <h3>Recent Trades</h3>
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