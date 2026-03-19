'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [portfolioData, setPortfolioData] = useState<{
    pl: number;
    pct: number;
    cash: number;
    portfolio_value: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(async data => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) {
          const holdings = await fetch('/api/holdings').then(r => r.json());
          setPortfolioData(holdings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pl = portfolioData?.pl ?? 0;
  const pct = portfolioData?.pct ?? 0;
  const isUp = pl >= 0;

  return (
    <div className={styles.wrap}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>
            <span className={styles.eyebrowDot} />
            Paper Trading Platform
          </div>
          <h1 className={styles.heroTitle}>
            Trade smarter.<br />
            <span className={styles.heroTitleAccent}>Risk nothing.</span>
          </h1>
          <p className={styles.heroSub}>
            Practice with real market data, AI-powered insights, and a $100K virtual portfolio. Learn the markets before you risk real money.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/trade" className={styles.btnPrimary}>Launch Dashboard</Link>
            <Link href="/learn" className={styles.btnGhost}>Browse Lessons →</Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>77+</strong>
              <span>Real Stocks</span>
            </div>
            <div className={styles.heroStat}>
              <strong>$100K</strong>
              <span>Starting Balance</span>
            </div>
            <div className={styles.heroStat}>
              <strong>0%</strong>
              <span>Risk</span>
            </div>
          </div>
        </div>

        {/* MOCK TRADING CARD */}
        <div className={styles.heroRight}>
          <div className={styles.mockCard}>
            <div className={styles.mockHeader}>
              <div className={styles.mockTicker}>
                <div className={styles.mockTickerIcon}>⚡</div>
                <div>
                  <div className={styles.mockTickerName}>NVDA</div>
                  <div className={styles.mockTickerSub}>NVIDIA Corp</div>
                </div>
              </div>
              <div className={styles.mockBadge}>Live</div>
            </div>
            <div className={styles.mockPrice}>$875.40</div>
            <div className={styles.mockChange}>+$23.18 (+2.72%) today</div>
            <div className={styles.mockChart}>
              <svg viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f6ef7" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#4f6ef7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,65 L20,60 L40,55 L60,58 L80,45 L100,40 L120,35 L140,38 L160,25 L180,20 L200,22 L220,15 L240,18 L260,10 L280,8 L300,5" stroke="#4f6ef7" strokeWidth="2" fill="none"/>
                <path d="M0,65 L20,60 L40,55 L60,58 L80,45 L100,40 L120,35 L140,38 L160,25 L180,20 L200,22 L220,15 L240,18 L260,10 L280,8 L300,5 L300,80 L0,80 Z" fill="url(#chartGrad)"/>
              </svg>
            </div>
            <div className={styles.mockGrid}>
              <div className={styles.mockGridItem}>
                <span>Open</span>
                <strong>$852.22</strong>
              </div>
              <div className={styles.mockGridItem}>
                <span>Volume</span>
                <strong>42.3M</strong>
              </div>
              <div className={styles.mockGridItem}>
                <span>52W High</span>
                <strong>$974.00</strong>
              </div>
              <div className={styles.mockGridItem}>
                <span>Mkt Cap</span>
                <strong>$2.15T</strong>
              </div>
            </div>
            <button className={styles.mockBuyBtn}>Buy NVDA — Paper Trade</button>
          </div>

          {/* PERSONALIZED PORTFOLIO BADGE — only shown when logged in */}
          {!loading && authenticated && portfolioData && (
            <div className={styles.floatingBadge}>
              <div className={styles.floatingBadgeIcon}>{isUp ? '📈' : '📉'}</div>
              <div className={styles.floatingBadgeText}>
                <strong>Your portfolio today</strong>
                <span style={{ color: isUp ? '#4ade80' : '#f87171' }}>
                  {isUp ? '+' : ''}${pl.toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Static badge for logged out users */}
          {!loading && !authenticated && (
            <div className={styles.floatingBadge}>
              <div className={styles.floatingBadgeIcon}>🚀</div>
              <div className={styles.floatingBadgeText}>
                <strong>Start with $100,000</strong>
                <span style={{ color: '#4ade80' }}>Zero risk. Real data.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.sectionLabel}>Everything you need</div>
        <h2 className={styles.sectionTitle}>Built for serious learners</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <div className={`${styles.featureIcon} ${styles.iconBlue}`}>📊</div>
            <h3>Live Charts</h3>
            <p>Candlestick, area, and line charts powered by real Yahoo Finance data. Multi-timeframe analysis just like the pros use.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={`${styles.featureIcon} ${styles.iconPurple}`}>🤖</div>
            <h3>AI Stock Analyst</h3>
            <p>Get entry and exit signals, risk assessments, and trade recommendations from an intelligent AI trading assistant.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={`${styles.featureIcon} ${styles.iconGreen}`}>🎓</div>
            <h3>Learning Academy</h3>
            <p>30+ lessons across beginner, intermediate, and advanced levels. Master technical analysis, risk management, and strategy.</p>
          </div>
        </div>
      </section>

      {/* CTA — only shown when NOT logged in */}
      {!loading && !authenticated && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Start trading today</h2>
            <p className={styles.ctaSub}>Free forever. No credit card. No risk.</p>
            <div className={styles.ctaBtns}>
              <Link href="/register" className={styles.btnPrimary}>Create Free Account</Link>
              <Link href="/login" className={styles.btnGhost}>Sign In →</Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Vestera</div>
        <div className={styles.footerText}>© 2026 Vestera · For educational purposes only. Not financial advice.</div>
      </footer>

    </div>
  );
}