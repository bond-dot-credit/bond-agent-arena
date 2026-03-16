'use client';

import React, { useEffect, useState } from 'react';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const AgentCarousel: React.FC = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch('/api/token-prices');
        if (response.ok) {
          const data = await response.json();
          if (data.status?.error_code === 429) { setLoading(false); return; }
          setTokenPrices([
            { symbol: 'BTC',  price: data.bitcoin?.usd  || 0, change24h: data.bitcoin?.usd_24h_change  || 0 },
            { symbol: 'ETH',  price: data.ethereum?.usd || 0, change24h: data.ethereum?.usd_24h_change || 0 },
            { symbol: 'MAMO', price: data.mamo?.usd     || 0, change24h: data.mamo?.usd_24h_change     || 0 },
            { symbol: 'GIZA', price: data.giza?.usd     || 0, change24h: data.giza?.usd_24h_change     || 0 },
          ]);
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchTokenPrices();
    const id = setInterval(fetchTokenPrices, 300_000);
    return () => clearInterval(id);
  }, []);

  const fmtPrice = (p: number) => {
    if (!p) return '—';
    if (p >= 1000) return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + p.toFixed(4);
  };
  const fmtChg = (c: number) => {
    if (!c) return '—';
    return (c >= 0 ? '+' : '') + c.toFixed(2) + '%';
  };

  const items = tokenPrices.length > 0 ? tokenPrices : [
    { symbol: 'BTC',  price: 68003,  change24h: -0.27 },
    { symbol: 'ETH',  price: 1972.86, change24h: -0.05 },
    { symbol: 'MAMO', price: 0.01,   change24h: -0.03 },
    { symbol: 'GIZA', price: 0.02,   change24h:  7.82 },
  ];
  const repeated = [...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden hidden lg:block"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
        height: '36px',
      }}
    >
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg2), transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg2), transparent)' }} />

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <span style={{ color: 'var(--s2)', fontSize: '0.75rem' }}>Loading markets…</span>
        </div>
      ) : (
        <div className="overflow-hidden h-full">
          <div className="flex items-center h-full animate-scroll whitespace-nowrap">
            {repeated.map((t, i) => (
              <div key={`${t.symbol}-${i}`} className="inline-flex items-center gap-2 mx-6">
                <span style={{ color: 'var(--s2)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  ${t.symbol}
                </span>
                <span style={{ color: 'var(--white)', fontSize: '0.75rem', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  {fmtPrice(t.price)}
                </span>
                <span style={{
                  color: t.change24h >= 0 ? 'var(--green)' : 'var(--red)',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--mono)',
                  fontWeight: 500,
                }}>
                  {fmtChg(t.change24h)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCarousel;
