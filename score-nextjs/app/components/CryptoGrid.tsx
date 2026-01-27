'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import dynamic from 'next/dynamic';

const ScorePanel = dynamic(() => import('@/app/components/iexec/ScorePanel'), {
  ssr: false,
  loading: () => <div className="p-6 text-center text-gray-500">Loading TEE Interface...</div>
});

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
        <div className="absolute z-50 w-64 p-3 text-xs text-black bg-white border border-gray-300 rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="text-gray-700 leading-relaxed">{text}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300" />
        </div>
      )}
    </div>
  );
};

const LeaderboardRow: React.FC<{ 
  agent: Agent; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  calculatedScore?: number;
  onScoreCalculated: (score: number) => void;
}> = ({ agent, index, isExpanded, onToggle, calculatedScore, onScoreCalculated }) => {
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
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 10000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Get AUM and AUA from agent data
  const getAUM = () => {
    return formatCurrency(agent.aum);
  };

  const getAUA = () => {
    return formatCurrency(agent.aua);
  };

  const getExpectedYield = () => {
    const yieldMap: Record<string, string> = {
      'Arma': '15% APY',
      'Mamo': '9.6% APY',
      'SurfLiquid': '14% APY',
      'ZyFAI': '11.5% APY',
      'Sail': '7.17% APY',
    };
    return yieldMap[agent.agent] || 'N/A';
  };

  return (
    <div className="group cursor-pointer transform transition-all duration-300">
      <div 
        className={`text-black rounded-xl border transition-all duration-300 relative overflow-hidden
          ${isExpanded 
            ? 'border-[#2727A5] shadow-lg scale-[1.01] bg-blue-50/30' 
            : 'border-gray-200 bg-white shadow-md hover:border-[#2727A5] hover:shadow-lg hover:scale-[1.01]'
          }`}
        onClick={onToggle}
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2727A5]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
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
                <div 
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-[#2727A5] flex items-center justify-center p-1 overflow-hidden shrink-0 transition-all duration-300 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(agent.website, '_blank');
                  }}
                >
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </div>
              )
            )}
            <p className="font-bold text-black group-hover:text-[#2727A5] transition-colors duration-300 text-base">{agent.agent}</p>
          </div>

          {/* Vault Type */}
          <div>
            <p className="text-sm text-gray-600">{agent.vaultType}</p>
          </div>

          {/* AUA */}
          <div className="text-center">
            <p className="font-bold text-black text-base">
              {getAUA()}
            </p>
          </div>

          {/* AUM */}
          <div className="text-center">
            <p className="font-bold text-black text-base">
              {getAUM()}
            </p>
          </div>

          {/* Expected Yield */}
          <div className="text-center">
            <p className="text-sm text-black font-semibold">{getExpectedYield()}</p>
          </div>

          {/* Bond Score */}
          <div className="text-center">
            {calculatedScore ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                {calculatedScore}/100
              </span>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                ${isExpanded 
                  ? 'bg-[#2727A5] text-white border-[#2727A5]' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 group-hover:border-[#2727A5] group-hover:text-[#2727A5]'}`}>
                {isExpanded ? 'Verifying...' : 'Verify'}
              </span>
            )}
          </div>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden px-4 py-4 relative z-10 space-y-3">
          {/* Rank + Agent Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRankDisplay(agent.rank)}
              {agent.medal && (
                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                  <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                </div>
              )}
              <p className="font-bold text-black group-hover:text-[#2727A5] transition-colors duration-300 text-sm">{agent.agent}</p>
            </div>
            
            {/* Mobile Expand Indicator */}
            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Vault Type</p>
              <p className="text-gray-700">{agent.vaultType}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">
                <span className="inline-flex items-center gap-1">
                  AUA
                  <Tooltip text="AUA means Asset Under Agent - How much is the Agent managing for the individual end user.">
                    <span className="w-3 h-3 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600 border border-gray-300">
                      !
                    </span>
                  </Tooltip>
                </span>
              </p>
              <p className="text-black font-bold">{getAUA()}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">
                <span className="inline-flex items-center gap-1">
                  AUM
                  <Tooltip text="AUM means Asset Under Management - How much is the Agent managing in total.">
                    <span className="w-3 h-3 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600 border border-gray-300">
                      !
                    </span>
                  </Tooltip>
                </span>
              </p>
              <p className="text-black font-bold">{getAUM()}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Bond Score</p>
              <p className="font-bold text-[#2727A5]">
                {calculatedScore ? `${calculatedScore}/100` : 'Tap to Verify'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Score Panel */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out px-4 md:px-6
          ${isExpanded ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ScorePanel 
          agent={agent} 
          onScoreCalculated={onScoreCalculated}
        />
      </div>
    </div>
  );
};

const CryptoGrid: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  const toggleExpand = (agentId: string) => {
    setExpandedAgentId(prev => prev === agentId ? null : agentId);
  };

  const handleScoreCalculated = (agentId: string, score: number) => {
    setScores(prev => ({ ...prev, [agentId]: score }));
  };

  return (
    <div className="mb-10">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:block mb-4 px-6">
        <div className="grid grid-cols-7 gap-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="text-left">Rank</div>
          <div>Agent</div>
          <div>Vault Type</div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              AUA
              <Tooltip text="AUA means Asset Under Agent - How much is the Agent managing for the individual end user.">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-[#2727A5]/20 flex items-center justify-center text-[10px] text-gray-600 hover:text-[#2727A5] transition-all cursor-help border border-gray-300 hover:border-[#2727A5]">
                  !
                </span>
              </Tooltip>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              AUM
              <Tooltip text="AUM means Asset Under Management - How much is the Agent managing in total.">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-[#2727A5]/20 flex items-center justify-center text-[10px] text-gray-600 hover:text-[#2727A5] transition-all cursor-help border border-gray-300 hover:border-[#2727A5]">
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
          <LeaderboardRow 
            key={agent.rank} 
            agent={agent} 
            index={index}
            isExpanded={expandedAgentId === agent.agent}
            onToggle={() => toggleExpand(agent.agent)}
            calculatedScore={scores[agent.agent]}
            onScoreCalculated={(score) => handleScoreCalculated(agent.agent, score)}
          />
        ))}
      </div>
    </div>
  );
};

export default CryptoGrid;
