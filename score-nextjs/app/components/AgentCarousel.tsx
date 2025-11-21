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
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,mamo,giza&vs_currencies=usd&include_24hr_change=true',
          { 
            cache: 'force-cache',
            next: { revalidate: 300 } // Cache for 5 minutes
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Check if we got rate limited
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
    const interval = setInterval(fetchTokenPrices, 300000); // Update every 5 minutes instead of 1 minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden mb-4 py-2 border-y border-gray-200 bg-gray-50 hidden lg:block">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex items-center justify-center">
            <span className="text-gray-600 text-sm">Loading token prices...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden mb-4 py-3 border-y border-gray-200 bg-gray-50 hidden lg:block">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex items-center justify-between gap-8">
          {/* Left - Agentic Alpha */}
          <div className="text-xl font-bold text-[#2727A5]">
            Agentic Alpha
          </div>

          {/* Center - Token Prices */}
          <div className="flex items-center justify-center gap-12 flex-1">
            {tokenPrices.length > 0 ? (
              tokenPrices.map((token) => (
                <div key={token.symbol} className="flex items-center gap-3">
                  <span className="text-[#2727A5] font-bold text-sm">${token.symbol}</span>
                  <span className="text-black font-mono text-sm">
                    {token.price > 0 
                      ? `$${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'N/A'
                    }
                  </span>
                  {token.price > 0 && (
                    <span className={`text-xs font-semibold ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-gray-600 text-sm">Unable to load prices</span>
            )}
          </div>

          {/* Right - Empty spacer for balance */}
          <div className="text-xl font-bold text-transparent">
            Agentic Alpha
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;
