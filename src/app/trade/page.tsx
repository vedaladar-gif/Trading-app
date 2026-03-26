'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './trade.module.css';
import VLogo from '@/components/VLogo';
import { buildChartOptions, getChartColors, isThemeDark } from '@/lib/chartTheme';

// ── Types ──────────────────────────────────────────────────────────────────

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

interface PriceAlert {
    id: string;
    ticker: string;
    condition: 'above' | 'below';
    target_price: number;
}

interface OhlcBar {
    time: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number;
}

interface WatchItem {
    sym: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
}

// ── Static watchlist (prices fetched dynamically) ─────────────────────────

const WATCHLIST_BASE: WatchItem[] = [
    { sym: 'AAPL',  name: 'Apple Inc.',       price: 0, change: 0, changePct: 0 },
    { sym: 'NVDA',  name: 'NVIDIA Corp.',      price: 0, change: 0, changePct: 0 },
    { sym: 'MSFT',  name: 'Microsoft Corp.',   price: 0, change: 0, changePct: 0 },
    { sym: 'TSLA',  name: 'Tesla Inc.',        price: 0, change: 0, changePct: 0 },
    { sym: 'GOOGL', name: 'Alphabet Inc.',     price: 0, change: 0, changePct: 0 },
    { sym: 'AMZN',  name: 'Amazon.com',        price: 0, change: 0, changePct: 0 },
    { sym: 'META',  name: 'Meta Platforms',    price: 0, change: 0, changePct: 0 },
    { sym: 'JPM',   name: 'JPMorgan Chase',    price: 0, change: 0, changePct: 0 },
    { sym: 'V',     name: 'Visa Inc.',         price: 0, change: 0, changePct: 0 },
    { sym: 'NFLX',  name: 'Netflix Inc.',      price: 0, change: 0, changePct: 0 },
    { sym: 'AMD',   name: 'AMD Inc.',          price: 0, change: 0, changePct: 0 },
    { sym: 'INTC',  name: 'Intel Corp.',       price: 0, change: 0, changePct: 0 },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const getMarketStatus = () => {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = et.getDay();
    const time = et.getHours() * 60 + et.getMinutes();
    if (day === 0 || day === 6) return { open: false, label: 'Market Closed', sub: 'Opens Monday 9:30 AM ET' };
    if (time < 570) return { open: false, label: 'Market Closed', sub: 'Opens at 9:30 AM ET' };
    if (time >= 570 && time < 960) return { open: true, label: 'Market Open', sub: 'Closes at 4:00 PM ET' };
    return { open: false, label: 'Market Closed', sub: 'Opens tomorrow 9:30 AM ET' };
};

// ── Component ──────────────────────────────────────────────────────────────

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
    const [authChecked, setAuthChecked] = useState(false);

    // OHLC tooltip state
    const [ohlcBar, setOhlcBar] = useState<OhlcBar | null>(null);
    const [ohlcLocked, setOhlcLocked] = useState(false);
    const ohlcLockedRef = useRef(false);

    // Watchlist state
    const [watchlist, setWatchlist] = useState<WatchItem[]>(WATCHLIST_BASE);
    const [watchlistLoading, setWatchlistLoading] = useState(true);

    // Price alert state
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
    const [alertPrice, setAlertPrice] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [alertMsgType, setAlertMsgType] = useState<'success' | 'error'>('success');
    const [alertSaving, setAlertSaving] = useState(false);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
    const seriesRef = useRef<unknown>(null);
    const prevPriceRef = useRef(0);
    const lcRef = useRef<typeof import('lightweight-charts') | null>(null);
    const themeObserverRef = useRef<MutationObserver | null>(null);

    const router = useRouter();
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const watchlistIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const marketStatus = getMarketStatus();

    // ── 1. Auth gate ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (!data.authenticated) router.replace('/login');
                else setAuthChecked(true);
            })
            .catch(() => router.replace('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 2. Prefill ticker from ?ticker= URL param ─────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('ticker');
        if (t) setTicker(t.toUpperCase());
    }, []);

    // ── 3. Fetch price for active ticker ─────────────────────────────────────
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
    }, []);

    // ── 4. Fetch holdings ─────────────────────────────────────────────────────
    const fetchHoldings = useCallback(async () => {
        try {
            const res = await fetch('/api/holdings');
            if (!res.ok) return;
            const data = await res.json();
            setCash(data.cash || 0);
            setHoldings(data.holdings || []);
        } catch { /* ignore */ }
    }, []);

    // ── 5. Fetch alerts ───────────────────────────────────────────────────────
    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch('/api/alerts');
            if (!res.ok) return;
            const data = await res.json();
            setAlerts(data.alerts || []);
        } catch { /* ignore */ }
    }, []);

    // ── 6. Fetch watchlist prices (parallel /api/quote for each ticker) ───────
    const fetchWatchlistPrices = useCallback(async () => {
        const results = await Promise.allSettled(
            WATCHLIST_BASE.map(async item => {
                try {
                    const res = await fetch(`/api/quote/${item.sym}`);
                    if (!res.ok) return null;
                    const d = await res.json();
                    return { sym: item.sym, price: d.price ?? 0, change: d.change ?? 0, changePct: d.changePct ?? 0 };
                } catch {
                    return null;
                }
            })
        );
        setWatchlist(prev => prev.map(item => {
            const found = results.find(
                r => r.status === 'fulfilled' && r.value?.sym === item.sym
            );
            if (found?.status === 'fulfilled' && found.value) {
                return { ...item, ...found.value };
            }
            return item;
        }));
        setWatchlistLoading(false);
    }, []);

    // ── 7. Chart initialisation ───────────────────────────────────────────────
    // IMPORTANT: depends on authChecked — the chartRef div is not in the DOM
    // until authChecked=true (spinner is shown before that).
    useEffect(() => {
        if (!authChecked) return;

        let mounted = true;

        const initChart = async () => {
            await new Promise(resolve => setTimeout(resolve, 80));
            if (!mounted || !chartRef.current) return;

            const lc = await import('lightweight-charts');
            if (!mounted || !chartRef.current) return;

            lcRef.current = lc;

            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }

            const dark = isThemeDark();
            const colors = getChartColors(dark);

            const chart = lc.createChart(chartRef.current, {
                width:  chartRef.current.clientWidth,
                height: chartRef.current.clientHeight || 440,
                layout: {
                    background: { type: lc.ColorType.Solid, color: 'transparent' },
                    textColor: colors.textColor,
                },
                grid: {
                    vertLines: { color: colors.gridColor },
                    horzLines: { color: colors.gridColor },
                },
                timeScale: {
                    timeVisible: true,
                    borderColor: colors.borderColor,
                },
                rightPriceScale: {
                    borderColor: colors.borderColor,
                },
                crosshair: { mode: 1 },
            });

            chartInstanceRef.current = chart;

            // Responsive resize
            const ro = new ResizeObserver(() => {
                if (chartRef.current && chartInstanceRef.current) {
                    chartInstanceRef.current.applyOptions({
                        width: chartRef.current.clientWidth,
                    });
                }
            });
            ro.observe(chartRef.current);

            // Live theme updates
            const themeObserver = new MutationObserver(() => {
                if (!chartInstanceRef.current) return;
                chartInstanceRef.current.applyOptions(buildChartOptions(isThemeDark()));
            });
            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme'],
            });
            themeObserverRef.current = themeObserver;

            // ── OHLC hover subscription ──────────────────────────────────────
            // seriesRef.current always holds the active series — safe to use
            // inside the handler even though the handler is created once here.
            type LcParam = {
                time?: unknown;
                seriesData: Map<object, Record<string, number>>;
            };

            chart.subscribeCrosshairMove((param) => {
                const p = param as unknown as LcParam;
                if (!p.time) {
                    if (!ohlcLockedRef.current) setOhlcBar(null);
                    return;
                }
                if (ohlcLockedRef.current) return;
                if (!seriesRef.current) return;
                const data = p.seriesData?.get(seriesRef.current as object);
                if (!data) return;
                setOhlcBar({
                    time: String(p.time),
                    open:  typeof data.open  === 'number' ? data.open  : undefined,
                    high:  typeof data.high  === 'number' ? data.high  : undefined,
                    low:   typeof data.low   === 'number' ? data.low   : undefined,
                    close: typeof data.close === 'number' ? data.close : undefined,
                    value: typeof data.value === 'number' ? data.value : undefined,
                });
            });

            // Click to lock / unlock the OHLC bar
            chart.subscribeClick((param) => {
                const p = param as unknown as LcParam;
                if (!p.time) return;
                const newLocked = !ohlcLockedRef.current;
                ohlcLockedRef.current = newLocked;
                setOhlcLocked(newLocked);
                if (newLocked && seriesRef.current) {
                    const data = p.seriesData?.get(seriesRef.current as object);
                    if (data) {
                        setOhlcBar({
                            time: String(p.time),
                            open:  typeof data.open  === 'number' ? data.open  : undefined,
                            high:  typeof data.high  === 'number' ? data.high  : undefined,
                            low:   typeof data.low   === 'number' ? data.low   : undefined,
                            close: typeof data.close === 'number' ? data.close : undefined,
                            value: typeof data.value === 'number' ? data.value : undefined,
                        });
                    }
                }
            });

            setChartReady(true);
        };

        initChart();

        return () => {
            mounted = false;
            themeObserverRef.current?.disconnect();
            themeObserverRef.current = null;
        };
    }, [authChecked]);

    // ── 8. Load chart data ────────────────────────────────────────────────────
    useEffect(() => {
        if (!chartReady || !chartInstanceRef.current || !lcRef.current) return;
        const chart = chartInstanceRef.current;
        const lc = lcRef.current;

        if (seriesRef.current) {
            try { chart.removeSeries(seriesRef.current as Parameters<typeof chart.removeSeries>[0]); } catch { /* ignore */ }
            seriesRef.current = null;
        }
        // Clear OHLC bar when chart data changes
        ohlcLockedRef.current = false;
        setOhlcLocked(false);
        setOhlcBar(null);

        const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
        const colors = getChartColors(isThemeDark());

        fetch(`/api/history/${ticker}?days=${days}`)
            .then(r => r.json())
            .then(data => {
                if (!data.history?.length || !chartInstanceRef.current) return;
                const bars = data.history as { date: string; open: number; high: number; low: number; close: number }[];

                if (chartType === 'candlestick') {
                    const s = chart.addSeries(lc.CandlestickSeries, {
                        upColor: '#4ade80', downColor: '#f87171',
                        borderUpColor: '#4ade80', borderDownColor: '#f87171',
                        wickUpColor: '#4ade80', wickDownColor: '#f87171',
                    });
                    s.setData(bars.map(b => ({
                        time: b.date, open: b.open, high: b.high, low: b.low, close: b.close,
                    })) as Parameters<typeof s.setData>[0]);
                    seriesRef.current = s;
                } else if (chartType === 'area') {
                    const s = chart.addSeries(lc.AreaSeries, {
                        topColor:    colors.areaTopColor,
                        bottomColor: colors.areaBottomColor,
                        lineColor:   colors.lineColor,
                        lineWidth:   2,
                    });
                    s.setData(bars.map(b => ({ time: b.date, value: b.close })) as Parameters<typeof s.setData>[0]);
                    seriesRef.current = s;
                } else {
                    const s = chart.addSeries(lc.LineSeries, { color: '#9b5de5', lineWidth: 2 });
                    s.setData(bars.map(b => ({ time: b.date, value: b.close })) as Parameters<typeof s.setData>[0]);
                    seriesRef.current = s;
                }

                chart.timeScale().fitContent();
            })
            .catch(e => console.error('Chart data error:', e));
    }, [ticker, chartType, timeframe, chartReady]);

    // ── 9. Data fetch after auth confirmed ────────────────────────────────────
    useEffect(() => {
        if (!authChecked) return;
        fetchPrice(ticker);
        fetchHoldings();
        fetchAlerts();
        fetchWatchlistPrices();

        if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
        priceIntervalRef.current = setInterval(() => fetchPrice(ticker), 30_000);

        // Refresh watchlist every 60s (less aggressive than ticker price)
        if (watchlistIntervalRef.current) clearInterval(watchlistIntervalRef.current);
        watchlistIntervalRef.current = setInterval(fetchWatchlistPrices, 60_000);

        return () => {
            if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
            if (watchlistIntervalRef.current) clearInterval(watchlistIntervalRef.current);
        };
    }, [authChecked, ticker, fetchPrice, fetchHoldings, fetchAlerts, fetchWatchlistPrices]);

    // ── 10. Stock search ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!searchQuery) { setSearchResults([]); setShowSearch(false); return; }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/search-stocks?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.results || []);
            setShowSearch(true);
        }, 200);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // ── Helpers ───────────────────────────────────────────────────────────────
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
                    created_at: new Date().toISOString(),
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

    const createAlert = async () => {
        const target = parseFloat(alertPrice);
        if (!alertPrice || isNaN(target) || target <= 0) {
            setAlertMsg('Enter a valid target price.');
            setAlertMsgType('error');
            return;
        }
        setAlertSaving(true);
        setAlertMsg('');
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, condition: alertCondition, targetPrice: target }),
            });
            const data = await res.json();
            if (data.alert) {
                setAlerts(prev => [data.alert, ...prev]);
                setAlertPrice('');
                setAlertMsg(`Alert set: ${ticker} ${alertCondition} $${target.toFixed(2)}`);
                setAlertMsgType('success');
            } else {
                setAlertMsg(data.error || 'Failed to create alert.');
                setAlertMsgType('error');
            }
        } catch {
            setAlertMsg('Network error.');
            setAlertMsgType('error');
        } finally {
            setAlertSaving(false);
            setTimeout(() => setAlertMsg(''), 4000);
        }
    };

    const deleteAlert = async (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        try {
            await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
        } catch { /* optimistic delete */ }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const unlockOhlc = () => {
        ohlcLockedRef.current = false;
        setOhlcLocked(false);
    };

    const portfolioValue = holdings.reduce((s, h) => s + h.value, 0);
    const tickerAlerts = alerts.filter(a => a.ticker === ticker);

    if (!authChecked) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--vt-bg)',
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

                {/* ── Stock Watchlist Sidebar (left) ────────────────────── */}
                <div className={styles.stockList}>
                    <div className={styles.stockListHeader}>
                        <div className={styles.stockListTitle}>
                            Watchlist
                            {watchlistLoading && (
                                <span className={styles.stockListUpdating}>updating…</span>
                            )}
                        </div>
                    </div>
                    <div className={styles.stockListItems}>
                        {watchlist.map((item, idx) => (
                            <div key={item.sym}>
                                <button
                                    className={`${styles.stockItem} ${ticker === item.sym ? styles.stockItemActive : ''}`}
                                    onClick={() => selectStock(item.sym)}
                                >
                                    <div className={styles.stockItemLeft}>
                                        <span className={styles.stockSym}>{item.sym}</span>
                                        <span className={styles.stockName}>{item.name}</span>
                                    </div>
                                    <div className={styles.stockItemRight}>
                                        <span className={styles.stockPrice}>
                                            {item.price > 0 ? `$${item.price.toFixed(2)}` : '—'}
                                        </span>
                                        <span
                                            className={styles.stockChange}
                                            style={{ color: item.changePct >= 0 ? '#4ade80' : '#f87171' }}
                                        >
                                            {item.price > 0
                                                ? `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%`
                                                : '—'
                                            }
                                        </span>
                                    </div>
                                </button>
                                {idx < watchlist.length - 1 && (
                                    <div className={styles.stockDivider} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Chart panel ───────────────────────────────────────── */}
                <div className={styles.chartPanel}>
                    <div className={styles.chartHeader}>
                        <div className={styles.tickerInfo}>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                                    placeholder="Search stock…"
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
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: marketStatus.open ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                                border: `1px solid ${marketStatus.open ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                                borderRadius: '100px', padding: '4px 12px',
                            }}>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: marketStatus.open ? '#4ade80' : '#f87171',
                                }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: marketStatus.open ? '#4ade80' : '#f87171' }}>
                                    {marketStatus.label}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--vt-text2)' }}>· {marketStatus.sub}</span>
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

                    {/* ── OHLC info bar — always visible, updates on hover ── */}
                    <div className={`${styles.ohlcBar} ${ohlcLocked ? styles.ohlcBarLocked : ''}`}>
                        {ohlcBar ? (
                            <>
                                <span className={styles.ohlcDate}>{ohlcBar.time}</span>

                                {ohlcBar.open !== undefined ? (
                                    /* Candlestick / area with OHLC data */
                                    <>
                                        <div className={styles.ohlcItem}>
                                            <span className={styles.ohlcItemLabel}>O</span>
                                            <span className={styles.ohlcItemVal}>${ohlcBar.open.toFixed(2)}</span>
                                        </div>
                                        <div className={styles.ohlcItem}>
                                            <span className={styles.ohlcItemLabel}>H</span>
                                            <span className={styles.ohlcItemVal} style={{ color: '#4ade80' }}>
                                                ${ohlcBar.high?.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={styles.ohlcItem}>
                                            <span className={styles.ohlcItemLabel}>L</span>
                                            <span className={styles.ohlcItemVal} style={{ color: '#f87171' }}>
                                                ${ohlcBar.low?.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={styles.ohlcItem}>
                                            <span className={styles.ohlcItemLabel}>C</span>
                                            <span
                                                className={styles.ohlcItemVal}
                                                style={{
                                                    color: (ohlcBar.close ?? 0) >= (ohlcBar.open ?? 0)
                                                        ? '#4ade80' : '#f87171',
                                                }}
                                            >
                                                ${ohlcBar.close?.toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    /* Area/Line chart — single value */
                                    <div className={styles.ohlcItem}>
                                        <span className={styles.ohlcItemLabel}>Price</span>
                                        <span className={styles.ohlcItemVal}>${ohlcBar.value?.toFixed(2)}</span>
                                    </div>
                                )}

                                {ohlcLocked ? (
                                    <button className={styles.ohlcLockBtn} onClick={unlockOhlc}>
                                        🔒 Click to unlock
                                    </button>
                                ) : (
                                    <span className={styles.ohlcHint}>Click chart to lock</span>
                                )}
                            </>
                        ) : (
                            <span className={styles.ohlcEmpty}>
                                Hover over the chart to see price details
                            </span>
                        )}
                    </div>

                    {/* Chart canvas — lightweight-charts fills this div */}
                    <div ref={chartRef} className={styles.chartArea} />
                </div>

                {/* ── Right Sidebar ────────────────────────────────────── */}
                <div className={styles.sidebar}>

                    {/* Portfolio summary */}
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

                    {/* Trade form */}
                    <div className={styles.sideCard}>
                        <h3>Trade {ticker}</h3>
                        <div className={styles.tradeForm}>
                            <label className={styles.tradeLabel}>
                                Shares
                                <input
                                    type="number" min="1"
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

                    {/* Price alerts */}
                    <div className={styles.sideCard}>
                        <h3>Price Alerts</h3>
                        <div className={styles.alertForm}>
                            <div className={styles.alertRow}>
                                <select
                                    className={styles.alertSelect}
                                    value={alertCondition}
                                    onChange={e => setAlertCondition(e.target.value as 'above' | 'below')}
                                >
                                    <option value="above">Goes above</option>
                                    <option value="below">Drops below</option>
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={alertPrice}
                                    onChange={e => setAlertPrice(e.target.value)}
                                    placeholder={price > 0 ? `$${price.toFixed(2)}` : 'Target price'}
                                    className={`${styles.tradeInput} ${styles.alertPriceInput}`}
                                />
                            </div>
                            <button
                                className={styles.alertBtn}
                                onClick={createAlert}
                                disabled={alertSaving}
                            >
                                {alertSaving ? 'Setting…' : `Set alert for ${ticker}`}
                            </button>
                            {alertMsg && (
                                <div className={`${styles.tradeStatus} ${alertMsgType === 'success' ? styles.tradeSuccess : styles.tradeError}`}>
                                    {alertMsg}
                                </div>
                            )}
                        </div>

                        {tickerAlerts.length > 0 && (
                            <div className={styles.alertsList}>
                                <div className={styles.alertsLabel}>Active for {ticker}</div>
                                {tickerAlerts.map(a => (
                                    <div key={a.id} className={styles.alertItem}>
                                        <div className={styles.alertItemLeft}>
                                            <span className={a.condition === 'above' ? styles.alertUp : styles.alertDown}>
                                                {a.condition === 'above' ? '↑' : '↓'}
                                            </span>
                                            <span className={styles.alertItemPrice}>${a.target_price.toFixed(2)}</span>
                                            <span className={styles.alertItemCond}>{a.condition}</span>
                                        </div>
                                        <button
                                            className={styles.alertDismiss}
                                            onClick={() => deleteAlert(a.id)}
                                            aria-label="Remove alert"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Holdings */}
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

                    {/* Recent trades */}
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
