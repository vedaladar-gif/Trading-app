import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.landingBackground}>
      <div className={styles.landingHero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Master Trading with Confidence</h1>
          <p className={styles.heroSubtitle}>
            Experience professional-grade paper trading with real market data, advanced charting tools, and AI-powered insights. Perfect for learning and strategy testing.
          </p>

          <div className={styles.heroCta}>
            <Link href="/trade" className={styles.btnPrimary}>📊 Launch Dashboard</Link>
            <Link href="/learn" className={styles.btnGhostHero}>📚 Start Learning</Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>77+</strong>
              Real Stocks
            </div>
            <div className={styles.heroStat}>
              <strong>$100K</strong>
              Starting Balance
            </div>
            <div className={styles.heroStat}>
              <strong>100%</strong>
              Risk Free
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.miniStats}>
            <div className={styles.miniStat}>
              <div className={styles.label}>📈 Trading Platform</div>
              <div className={styles.val}>Live Charts</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.label}>🤖 AI Analyst</div>
              <div className={styles.val}>Real-time Signals</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.label}>📚 Learning Hub</div>
              <div className={styles.val}>30+ Lessons</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.label}>💼 Portfolio</div>
              <div className={styles.val}>Track P&amp;L</div>
            </div>
          </div>
          <p>✓ Real-time prices from Yahoo Finance<br />✓ Multi-timeframe technical analysis<br />✓ AI-powered trade recommendations</p>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.icon}>📊</div>
          <h4>Professional Charts</h4>
          <p>Switch between candlestick, area, and line charts. Multi-timeframe analysis with TradingView-grade accuracy and performance.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.icon}>🤖</div>
          <h4>AI Stock Analyst</h4>
          <p>Get real-time trading signals, entry/exit recommendations, and risk management tips from our intelligent trading assistant.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.icon}>🎓</div>
          <h4>Learning Academy</h4>
          <p>Master trading across 3 difficulty levels with 30+ interactive lessons, quizzes, and practice strategies. Learn risk management the right way.</p>
        </div>
      </div>
    </div>
  );
}
