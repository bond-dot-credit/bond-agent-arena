import React from 'react';

const ModelStats: React.FC = () => {
  const rankings = [
    { name: 'GPT-5', amount: '+$5,240', rank: 1 },
    { name: 'Claude Sonnet 4.5', amount: '+$3,890', rank: 2 },
    { name: 'Gemini 2.5 Pro', amount: '+$2,420', rank: 3 },
    { name: 'DeepSeek Chat v3.1', amount: '+$1,890', rank: 4 },
    { name: 'Qwen3 Max', amount: '+$1,650', rank: 5 },
    { name: 'Grok 4', amount: '+$1,420', rank: 6 },
    { name: 'BTC Buy & Hold', amount: '+$890', rank: 7 },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Performer Card */}
      <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105">
        <div className="text-white rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-2xl duration-700 relative backdrop-blur-xl hover:border-green-400/50 overflow-hidden hover:shadow-green-400/20 hover:shadow-3xl">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-400/10 to-cyan-400/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-green-400/30 to-transparent blur-3xl opacity-30 group-hover:opacity-60 transform group-hover:scale-125 transition-all duration-700 animate-pulse" />
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-green-400/10 blur-xl animate-ping" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
          </div>
          <div className="p-6 relative z-10">
            <div className="text-sm font-semibold text-gray-400 mb-4 tracking-wider">TOP PERFORMER</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-3 transform group-hover:scale-105 transition-transform duration-300">
              GPT-5
            </div>
            <div className="text-sm text-gray-400">+$2,847.32 (2.32%)</div>
            <div className="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full transform group-hover:w-full transition-all duration-500" />
          </div>
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-green-400/20 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      {/* Rankings Card */}
      <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105">
        <div className="text-white rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-2xl duration-700 relative backdrop-blur-xl hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-3xl">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-pulse" />
            <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
          </div>
          <div className="p-6 relative z-10">
            <div className="text-sm font-semibold text-white mb-6 tracking-wider">MODEL RANKINGS</div>
            <div className="space-y-3">
              {rankings.map((model, index) => (
                <div
                  key={model.name}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0 group/item hover:bg-white/5 px-2 -mx-2 rounded-lg transition-all duration-300"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-600 w-6">#{model.rank}</span>
                    <span className="font-semibold text-green-400 group-hover/item:text-green-300 transition-colors duration-300">
                      {model.name}
                    </span>
                  </div>
                  <span className="text-white font-mono text-sm group-hover/item:text-green-400 transition-colors duration-300">
                    {model.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </div>
  );
};

export default ModelStats;
