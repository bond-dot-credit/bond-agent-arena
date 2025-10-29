'use client';

import React, { useEffect, useState } from 'react';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const AgentCarousel: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([
    { symbol: 'BTC', price: 0, change24h: 0 },
    { symbol: 'ETH', price: 0, change24h: 0 },
    { symbol: 'TAO', price: 0, change24h: 0 },
    { symbol: 'BOND', price: 0, change24h: 0 },
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,bittensor,bond&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        setPrices([
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
            symbol: 'TAO', 
            price: data.bittensor?.usd || 0, 
            change24h: data.bittensor?.usd_24h_change || 0 
          },
          { 
            symbol: 'BOND', 
            price: data.bond?.usd || 0, 
            change24h: data.bond?.usd_24h_change || 0 
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden mb-4 py-2 border-y border-[#c9b382]/20 bg-gradient-to-r from-black/50 via-[#c9b382]/5 to-black/50">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex items-center justify-center gap-12">
          {prices.map((crypto) => (
            <div key={crypto.symbol} className="flex items-center gap-3">
              <span className="text-[#c9b382] font-bold text-sm">${crypto.symbol}</span>
              <span className="text-white font-mono text-sm">
                ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold ${crypto.change24h >= 0 ? 'text-[#c9b382]' : 'text-red-400'}`}>
                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;
