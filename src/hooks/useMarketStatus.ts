'use client';

import { useState, useEffect } from 'react';
import { getMarketStatus, type MarketStatus } from '@/lib/marketStatus';

/**
 * React hook that returns the live U.S. market status, re-evaluated every
 * `intervalMs` milliseconds (default 60 s) so the badge updates automatically
 * without a page refresh — e.g. when the market opens at 9:30 AM ET.
 */
export function useMarketStatus(intervalMs = 60_000): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>(() => getMarketStatus());

  useEffect(() => {
    const update = () => setStatus(getMarketStatus());
    update(); // re-sync immediately on mount (handles SSR hydration skew)

    const timer = setInterval(update, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return status;
}
