import React from 'react';

interface CryptoCardProps {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  delay: number;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ symbol, price, change, isPositive, delay }) => {
  return (
    <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
      <div className="text-white rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-2xl duration-700 z-10 relative backdrop-blur-xl hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-3xl">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div style={{animationDelay: `${delay}s`}} className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-green-400/20 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-pulse" />
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 blur-xl animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>
        <div className="p-5 relative z-10">
          <div className="flex flex-col">
            <div className="mb-3">
              <p className={`text-base font-bold ${isPositive ? 'text-green-400' : 'text-red-400'} group-hover:text-white transition-colors duration-300`}>
                {symbol}
              </p>
            </div>
            <div className="mb-2 transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                {price}
              </p>
            </div>
            <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {change}
            </div>
            <div className="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full transform group-hover:w-full transition-all duration-500" />
          </div>
        </div>
        <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

const CryptoGrid: React.FC = () => {
  const cryptos = [
    { symbol: 'BTC', price: '$95,000.00', change: '+2.34%', isPositive: true },
    { symbol: 'ETH', price: '$3,500.00', change: '+1.87%', isPositive: true },
    { symbol: 'SOL', price: '$180.00', change: '-0.92%', isPositive: false },
    { symbol: 'BNB', price: '$600.00', change: '+0.45%', isPositive: true },
    { symbol: 'DOGE', price: '$0.3500', change: '+3.21%', isPositive: true },
    { symbol: 'XRP', price: '$0.50', change: '-1.15%', isPositive: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
      {cryptos.map((crypto, index) => (
        <CryptoCard
          key={crypto.symbol}
          symbol={crypto.symbol}
          price={crypto.price}
          change={crypto.change}
          isPositive={crypto.isPositive}
          delay={index * 0.15}
        />
      ))}
    </div>
  );
};

export default CryptoGrid;
