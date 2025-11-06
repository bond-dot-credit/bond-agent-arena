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
          { cache: 'no-store' }
        );

        if (response.ok) {
          const data = await response.json();

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
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
        setLoading(false);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden mb-4 py-2 border-y border-[#c9b382]/20 bg-gradient-to-r from-black/50 via-[#c9b382]/5 to-black/50 hidden lg:block">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading token prices...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden mb-4 py-3 border-y border-[#c9b382]/20 bg-gradient-to-r from-black/50 via-[#c9b382]/5 to-black/50 hidden lg:block">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-4 md:gap-12">
          {tokenPrices.map((token) => (
            <div key={token.symbol} className="flex items-center gap-2 md:gap-3">
              <span className="text-[#c9b382] font-bold text-xs md:text-sm">${token.symbol}</span>
              <span className="text-white font-mono text-xs md:text-sm">
                ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] md:text-xs font-semibold ${token.change24h >= 0 ? 'text-[#c9b382]' : 'text-red-400'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;
