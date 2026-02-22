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

          if (data.status?.error_code === 429) {
            console.warn('CoinGecko API rate limit reached');
            setLoading(false);
            return;
          }

          const prices: TokenPrice[] = [
            {
              symbol: 'BTC',
              price: data.bitcoin?.usd || 0,
              change24h: data.bitcoin?.usd_24h_change || 0
            },
            {
              symbol: 'ETH',
              price: data.ethereum?.usd || 0,
              change24h: data.ethereum?.usd_24h_change || 0
            },
            {
              symbol: 'MAMO',
              price: data.mamo?.usd || 0,
              change24h: data.mamo?.usd_24h_change || 0
            },
            {
              symbol: 'GIZA',
              price: data.giza?.usd || 0,
              change24h: data.giza?.usd_24h_change || 0
            }
          ];

          setTokenPrices(prices);
        } else if (response.status === 429) {
          console.warn('CoinGecko API rate limit reached');
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden mb-4 py-2 border-b border-gray-100 bg-gray-50/50 hidden lg:block">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex items-center justify-center h-6">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '—';
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    if (change === 0) return '—';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const tickerItems = tokenPrices.length > 0 
    ? tokenPrices 
    : [
        { symbol: 'BTC', price: 68003, change24h: -0.27 },
        { symbol: 'ETH', price: 1972.86, change24h: -0.05 },
        { symbol: 'MAMO', price: 0.01, change24h: -0.03 },
        { symbol: 'GIZA', price: 0.02, change24h: 7.82 }
      ];

  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden mb-4 py-2.5 border-b border-gray-100 bg-white hidden lg:block">
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />
      
      <div className="overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {duplicatedItems.map((token, idx) => (
            <div 
              key={`${token.symbol}-${idx}`} 
              className="inline-flex items-center gap-2 mx-6 text-sm"
            >
              <span className="text-black/50 font-medium">${token.symbol}</span>
              <span className="text-black font-mono font-medium">{formatPrice(token.price)}</span>
              <span className={`text-xs font-medium ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatChange(token.change24h)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AgentCarousel;
