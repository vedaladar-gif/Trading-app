'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HoldingEntry {
    stock: string;
    shares: number;
    current_price: number;
    value: number;
}

interface LeaderboardEntry {
    rank: number;
    username: string;
    cash: number;
    pl: number;
    pct: number;
    isCurrentUser: boolean;
}

export default function StatsPage() {
    const [cash, setCash] = useState(0);
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [pl, setPl] = useState(0);
    const [pct, setPct] = useState(0);
    const [holdings, setHoldings] = useState<HoldingEntry[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch('/api/holdings').then(r => {
                if (r.status === 401) { router.push('/login'); return null; }
                return r.json();
            }),
            fetch('/api/leaderboard').then(r => r.json()),
        ]).then(([holdingsData, lbData]) => {
            if (holdingsData) {
                setCash(holdingsData.cash);
                setPortfolioValue(holdingsData.portfolio_value);
                setPl(holdingsData.pl);
                setPct(holdingsData.pct);
                setHoldings(holdingsData.holdings || []);
            }
            if (lbData?.leaderboard) {
                setLeaderboard(lbData.leaderboard);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: '#060810',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '-48px -24px 0', fontFamily: 'Inter, sans-serif',
            }}>
                <div style={{
                    width: '32px', height: '32px',
                    border: '2px solid rgba(79,110,247,0.15)',
                    borderTopColor: '#4f6ef7',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    const totalAccount = cash + portfolioValue;
    const isUp = pl >= 0;
    const myRank = leaderboard.find(u => u.isCurrentUser)?.rank;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#060810',
            margin: '-48px -24px 0',
            fontFamily: 'Inter, sans-serif',
            padding: '48px 32px 80px',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{
                        fontSize: '30px', fontWeight: 700,
                        color: '#fff', margin: '0 0 6px',
                        letterSpacing: '-1px',
                    }}>Portfolio</h1>
                    <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                        Your performance and standings
                    </p>
                </div>

                {/* Stat cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '28px',
                }}>
                    {[
                        { label: 'Account Value', value: `$${totalAccount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#fff' },
                        { label: 'Available Cash', value: `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#fff' },
                        { label: 'Holdings Value', value: `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#fff' },
                        { label: 'Total Return', value: `${isUp ? '+' : ''}${pct.toFixed(2)}%`, color: isUp ? '#4ade80' : '#f87171' },
                    ].map((card, i) => (
                        <div key={i} style={{
                            background: '#0d1117',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px',
                            padding: '20px 24px',
                        }}>
                            <div style={{
                                fontSize: '11px', fontWeight: 600,
                                color: '#374151', textTransform: 'uppercase',
                                letterSpacing: '0.8px', marginBottom: '10px',
                            }}>{card.label}</div>
                            <div style={{
                                fontSize: '22px', fontWeight: 700,
                                color: card.color, letterSpacing: '-0.5px',
                            }}>{card.value}</div>
                        </div>
                    ))}
                </div>

                {/* P&L banner */}
                <div style={{
                    background: isUp ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    borderRadius: '12px',
                    padding: '16px 24px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isUp ? '#4ade80' : '#f87171',
                        }} />
                        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                            Total P&L since start
                        </span>
                    </div>
                    <span style={{
                        fontSize: '18px', fontWeight: 700,
                        color: isUp ? '#4ade80' : '#f87171',
                        letterSpacing: '-0.5px',
                    }}>
                        {isUp ? '+' : ''}${pl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

                    {/* Holdings */}
                    <div style={{
                        background: '#0d1117',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        padding: '24px',
                    }}>
                        <h2 style={{
                            fontSize: '14px', fontWeight: 700,
                            color: '#fff', margin: '0 0 20px',
                            letterSpacing: '-0.3px',
                        }}>Current Holdings</h2>

                        {holdings.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Stock', 'Shares', 'Price', 'Value'].map(h => (
                                            <th key={h} style={{
                                                padding: '8px 12px', textAlign: 'left',
                                                fontSize: '11px', fontWeight: 600,
                                                color: '#374151', textTransform: 'uppercase',
                                                letterSpacing: '0.8px',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map(h => (
                                        <tr key={h.stock}>
                                            <td style={{ padding: '12px', fontWeight: 700, color: '#fff', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h.stock}</td>
                                            <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h.shares}</td>
                                            <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>${h.current_price?.toFixed(2)}</td>
                                            <td style={{ padding: '12px', color: '#4f6ef7', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>${h.value?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px' }}>No holdings yet</p>
                                <a href="/trade" style={{
                                    color: '#4f6ef7', textDecoration: 'none',
                                    fontSize: '13px', fontWeight: 600,
                                }}>Start trading →</a>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard */}
                    <div style={{
                        background: '#0d1117',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        padding: '24px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{
                                fontSize: '14px', fontWeight: 700,
                                color: '#fff', margin: 0,
                            }}>Leaderboard</h2>
                            {myRank && (
                                <span style={{
                                    fontSize: '12px', fontWeight: 600,
                                    color: '#4f6ef7',
                                    background: 'rgba(79,110,247,0.1)',
                                    border: '1px solid rgba(79,110,247,0.2)',
                                    padding: '3px 10px', borderRadius: '100px',
                                }}>You #{myRank}</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {leaderboard.map((entry) => (
                                <div key={entry.rank} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    background: entry.isCurrentUser ? 'rgba(79,110,247,0.08)' : 'transparent',
                                    border: entry.isCurrentUser ? '1px solid rgba(79,110,247,0.15)' : '1px solid transparent',
                                    transition: 'background 0.2s',
                                }}>
                                    {/* Rank */}
                                    <div style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '6px',
                                        background: entry.rank === 1 ? 'rgba(251,191,36,0.15)' :
                                                   entry.rank === 2 ? 'rgba(156,163,175,0.15)' :
                                                   entry.rank === 3 ? 'rgba(180,83,9,0.15)' :
                                                   'rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 700,
                                        color: entry.rank === 1 ? '#fbbf24' :
                                               entry.rank === 2 ? '#9ca3af' :
                                               entry.rank === 3 ? '#b45309' :
                                               '#374151',
                                        flexShrink: 0,
                                    }}>{entry.rank}</div>

                                    {/* Username */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px', fontWeight: entry.isCurrentUser ? 700 : 500,
                                            color: entry.isCurrentUser ? '#fff' : '#e8eaf0',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {entry.username.includes('@') ? entry.username.split('@')[0] : entry.username}
                                            {entry.isCurrentUser && <span style={{ color: '#4f6ef7', marginLeft: '6px', fontSize: '11px' }}>you</span>}
                                        </div>
                                    </div>

                                    {/* P&L */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{
                                            fontSize: '13px', fontWeight: 600,
                                            color: entry.pl >= 0 ? '#4ade80' : '#f87171',
                                        }}>
                                            {entry.pl >= 0 ? '+' : ''}{entry.pct.toFixed(2)}%
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#374151' }}>
                                            ${entry.cash.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}