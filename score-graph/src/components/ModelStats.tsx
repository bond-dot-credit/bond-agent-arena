import React from 'react';
import { agentsData } from './CryptoGrid';

const ModelStats: React.FC = () => {
  const rankings = agentsData.map(agent => ({
    name: agent.agent,
    amount: agent.roi,
    rank: agent.rank,
    performanceScore: agent.performanceScore
  }));

  const getValidationBadge = (status: string) => {
    const badges = {
      'verified': { bg: 'bg-green-400/20', text: 'text-green-400', border: 'border-green-400/30', label: 'V' },
      'processing': { bg: 'bg-yellow-400/20', text: 'text-yellow-400', border: 'border-yellow-400/30', label: 'P' },
      'pending': { bg: 'bg-blue-400/20', text: 'text-blue-400', border: 'border-blue-400/30', label: 'W' },
      'warning': { bg: 'bg-red-400/20', text: 'text-red-400', border: 'border-red-400/30', label: '!' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Agent Leaderboard */}
      <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105">
        <div className="text-white rounded-2xl border border-white/10 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md shadow-2xl duration-700 relative hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-3xl">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-pulse" />
            <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
          </div>
          <div className="p-6 relative z-10">
            <div className="text-sm font-semibold text-white mb-6 tracking-wider">AGENT LEADERBOARD</div>
            <div className="space-y-3">
              {agentsData.map((agent, index) => (
                <div
                  key={agent.agent}
                  className="group/item hover:bg-white/5 p-4 -mx-3 rounded-lg transition-all duration-300 border-b border-white/5 last:border-b-0"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {agent.medal ? (
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5">
                          <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-500 w-6">#{agent.rank}</span>
                      )}
                      <span className="font-bold text-white group-hover/item:text-green-400 transition-colors duration-300">
                        {agent.agent}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getValidationBadge(agent.validation)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ROI</span>
                      <span className={`font-bold ${agent.roi.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {agent.roi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Performance</span>
                      <span className="text-white font-mono">{agent.performanceScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Risk</span>
                      <span className="text-white font-mono">{agent.riskScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bond</span>
                      <span className={`font-mono ${agent.bondScore.startsWith('+') ? 'text-green-400' : agent.bondScore.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
                        {agent.bondScore}
                      </span>
                    </div>
                  </div>
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
