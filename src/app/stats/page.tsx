'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './stats.module.css';

interface HoldingEntry {
    stock: string;
    shares: number;
    current_price: number;
    value: number;
}

export default function StatsPage() {
    const [cash, setCash] = useState(0);
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [pl, setPl] = useState(0);
    const [pct, setPct] = useState(0);
    const [holdings, setHoldings] = useState<HoldingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/holdings')
            .then(res => {
                if (res.status === 401) { router.push('/login'); return null; }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                setCash(data.cash);
                setPortfolioValue(data.portfolio_value);
                setPl(data.pl);
                setPct(data.pct);
                setHoldings(data.holdings || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return <div className={styles.loadingWrap}><div className={styles.spinner} /><p>Loading portfolio...</p></div>;
    }

    const totalAccount = cash + portfolioValue;

    return (
        <div className={styles.statsPage}>
            <h1>📈 Portfolio Statistics</h1>

            <div className={styles.topCards}>
                <div className={styles.statCard}>
                    <h3>Account Value</h3>
                    <div className={styles.bigVal}>${totalAccount.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Available Cash</h3>
                    <div className={styles.bigVal}>${cash.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Holdings Value</h3>
                    <div className={styles.bigVal}>${portfolioValue.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Total P&amp;L</h3>
                    <div className={`${styles.bigVal} ${pl >= 0 ? styles.profit : styles.loss}`}>
                        {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                    </div>
                </div>
            </div>

            {holdings.length > 0 && (
                <div className={styles.holdingsCard}>
                    <h2>Current Holdings</h2>
                    <table className={styles.holdingsTable}>
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Shares</th>
                                <th>Price</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map(h => (
                                <tr key={h.stock}>
                                    <td className={styles.tickerCell}>{h.stock}</td>
                                    <td>{h.shares}</td>
                                    <td>${h.current_price?.toFixed(2)}</td>
                                    <td className={styles.valueCell}>${h.value?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {holdings.length === 0 && (
                <div className={styles.emptyState}>
                    <p>📭 No holdings yet. Head to the <a href="/trade">Trading Dashboard</a> to start trading!</p>
                </div>
            )}
        </div>
    );
}
