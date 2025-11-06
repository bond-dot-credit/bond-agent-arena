'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <div className="absolute z-50 w-64 p-3 text-xs text-white bg-black/95 border border-white/20 rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="text-gray-300 leading-relaxed">{text}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20" />
        </div>
      )}
    </div>
  );
};

const LeaderboardRow: React.FC<{ agent: Agent; index: number }> = ({ agent, index }) => {
  const getRankDisplay = (rank: number) => {
    const rankStyles = {
      1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      2: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
      3: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    };

    const style = rankStyles[rank as keyof typeof rankStyles] || 'bg-gray-700/30 text-gray-500 border-gray-600/30';

    return (
      <span className={`w-8 h-8 rounded-full ${style} flex items-center justify-center text-sm font-semibold border`}>
        {rank}
      </span>
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.01]">
      <div className="text-white rounded-xl border border-white/10 bg-linear-to-br from-[#010101] via-[#090909] to-[#010101] shadow-xl duration-500 relative backdrop-blur-xl hover:border-[#c9b382]/30 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#c9b382]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>

        {/* Desktop View - Hidden on mobile */}
        <div className="hidden md:grid px-6 py-4 relative z-10 grid-cols-7 gap-6 items-center">
          {/* Rank */}
          <div className="flex items-center justify-start">
            {getRankDisplay(agent.rank)}
          </div>

          {/* Agent Name + Logo */}
          <div className="flex items-center gap-3">
            {agent.medal && (
              agent.website ? (
                <a 
                  href={agent.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-white/10 hover:border-[#c9b382]/50 flex items-center justify-center p-1 overflow-hidden shrink-0 transition-all duration-300 hover:scale-110"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </a>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white border border-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </div>
              )
            )}
            <p className="font-bold text-white group-hover:text-[#c9b382] transition-colors duration-300 text-base">{agent.agent}</p>
          </div>

          {/* Vault Type */}
          <div>
            <p className="text-sm text-gray-400">{agent.vaultType}</p>
          </div>

          {/* AUA */}
          <div className="text-center">
            <p className="font-bold text-white text-base">
              {formatCurrency(agent.aua || 2000.01)}
            </p>
          </div>

          {/* AUM */}
          <div className="text-center">
            <p className="font-bold text-white text-base">
              {formatCurrency(agent.aum || 50000000)}
            </p>
          </div>

          {/* Expected Yield */}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-semibold">COMING SOON</p>
          </div>

          {/* Bond Score */}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-semibold">COMING SOON</p>
          </div>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden px-4 py-4 relative z-10 space-y-3">
          {/* Rank + Agent Name */}
          <div className="flex items-center gap-3">
            {getRankDisplay(agent.rank)}
            {agent.medal && (
              agent.website ? (
                <a 
                  href={agent.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-full bg-white border border-white/10 hover:border-[#c9b382]/50 flex items-center justify-center p-0.5 overflow-hidden shrink-0 transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </a>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white border border-white/10 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </div>
              )
            )}
            <p className="font-bold text-white group-hover:text-[#c9b382] transition-colors duration-300 text-sm">{agent.agent}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Vault Type</p>
              <p className="text-gray-300">{agent.vaultType}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">
                <span className="inline-flex items-center gap-1">
                  AUA
                  <Tooltip text="AUA means Asset Under Agent - How much is the Agent managing for the individual end user.">
                    <span className="w-3 h-3 rounded-full bg-gray-700/50 flex items-center justify-center text-[8px] text-gray-400 border border-gray-600/50">
                      !
                    </span>
                  </Tooltip>
                </span>
              </p>
              <p className="text-white font-bold">{formatCurrency(agent.aua || 2000.01)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">
                <span className="inline-flex items-center gap-1">
                  AUM
                  <Tooltip text="AUM means Asset Under Management - How much is the Agent managing in total.">
                    <span className="w-3 h-3 rounded-full bg-gray-700/50 flex items-center justify-center text-[8px] text-gray-400 border border-gray-600/50">
                      !
                    </span>
                  </Tooltip>
                </span>
              </p>
              <p className="text-white font-bold">{formatCurrency(agent.aum || 50000000)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Expected Yield</p>
              <p className="text-gray-500 font-semibold text-[10px]">COMING SOON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CryptoGrid: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  return (
    <div className="mb-10">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:block mb-4 px-6">
        <div className="grid grid-cols-7 gap-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="text-left">Rank</div>
          <div>Agent</div>
          <div>Vault Type</div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              AUA
              <Tooltip text="AUA means Asset Under Agent - How much is the Agent managing for the individual end user.">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-700/50 hover:bg-[#c9b382]/30 flex items-center justify-center text-[10px] text-gray-400 hover:text-[#c9b382] transition-all cursor-help border border-gray-600/50 hover:border-[#c9b382]/50">
                  !
                </span>
              </Tooltip>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              AUM
              <Tooltip text="AUM means Asset Under Management - How much is the Agent managing in total.">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-700/50 hover:bg-[#c9b382]/30 flex items-center justify-center text-[10px] text-gray-400 hover:text-[#c9b382] transition-all cursor-help border border-gray-600/50 hover:border-[#c9b382]/50">
                  !
                </span>
              </Tooltip>
            </div>
          </div>
          <div className="text-center">Expected Yield</div>
          <div className="text-center">Bond Score</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {agents.map((agent, index) => (
          <LeaderboardRow key={agent.rank} agent={agent} index={index} />
        ))}
      </div>
    </div>
  );
};

export default CryptoGrid;
