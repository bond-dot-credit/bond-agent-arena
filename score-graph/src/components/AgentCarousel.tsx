import React from 'react';
import { agentsData } from './CryptoGrid';

const AgentCarousel: React.FC = () => {
  // Duplicate agents multiple times for seamless infinite scroll
  const duplicatedAgents = [...agentsData, ...agentsData, ...agentsData, ...agentsData, ...agentsData, ...agentsData];

  return (
    <div className="relative overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll-seamless">
        {duplicatedAgents.map((agent, index) => (
          <div
            key={`${agent.agent}-${index}`}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0"
          >
            <div className="text-white rounded-xl border border-white/10 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md shadow-xl duration-500 relative hover:border-green-400/30 overflow-hidden w-64">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
              </div>
              <div className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  {agent.medal ? (
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1">
                      <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-gray-300">
                      {agent.rank}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                      {agent.agent}
                    </p>
                    <p className="text-xs text-gray-500">Rank #{agent.rank}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">ROI</p>
                    <p className={`text-sm font-bold ${agent.roi.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.roi}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-sm font-bold text-white font-mono">{agent.performanceScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Risk</p>
                    <p className="text-sm font-bold text-white font-mono">{agent.riskScore}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient fade effects on edges */}
      <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default AgentCarousel;
