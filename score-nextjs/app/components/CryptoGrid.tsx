'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
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
  const { ready, authenticated, login } = usePrivy();
  
  const getRankDisplay = (rank: number) => {
    const rankStyles = {
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-blue-50 text-blue-600',
      3: 'bg-gray-100 text-gray-700',
    };

    const style = rankStyles[rank as keyof typeof rankStyles] || 'bg-gray-50 text-gray-500';

    return (
      <span className={`w-8 h-8 rounded-full ${style} flex items-center justify-center text-sm font-bold`}>
        {rank}
      </span>
    );
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toFixed(2)}`;
  };

  const getAUM = () => formatCurrency(agent.aum);
  const getAUA = () => formatCurrency(agent.aua);
  const getExpectedYield = () => agent.expectedYield || 'N/A';
  const getNativeYield = () => formatCurrency(agent.nativeYield);
  const getRewards = () => formatCurrency(agent.rewards);

  return (
    <React.Fragment>
      <tr 
        className={`hover:bg-blue-50 transition-colors cursor-pointer ${
          isExpanded ? 'bg-blue-50 border-l-4 border-l-[#1172E1]' : ''
        }`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          {getRankDisplay(agent.rank)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            {agent.medal && (
              agent.website ? (
                <div 
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-[#1172E1] flex items-center justify-center p-1 overflow-hidden shrink-0 transition-all duration-300"
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
            <span className="font-semibold text-gray-900">{agent.agent}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-medium text-[#1172E1]">
          {getAUA()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          {getAUM()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
          {getNativeYield()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
          {getRewards()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          {getExpectedYield()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {calculatedScore ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1172E1]/10 text-[#1172E1] border border-[#1172E1]/20">
              {calculatedScore}/100
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700 transition-all duration-300 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          )}
        </td>
      </tr>
      
      {/* Expanded Row */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-gray-50 border-t border-gray-100 p-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1172E1] mb-1">Verify Bond Score</h3>
                    <p className="text-sm text-gray-600">Run a confidential TEE computation to verify this agent's score.</p>
                  </div>
                  {ready && authenticated ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Wallet Connected
                    </div>
                    ) : (
                    <button
                      onClick={login}
                      className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Connect Wallet to Verify
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-mono rounded border border-blue-100">
                    Dataset: 0xca38e4de...b1a2 ↗
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                    Requires <span className="font-semibold text-gray-900">0.1 RLC</span> and <span className="font-semibold text-gray-900">ETH (gas)</span> on <span className="font-semibold text-gray-900">Arbitrum One</span>
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#1172E1] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-xs">WHY VERIFY WITH EXISTING DATA?</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        You are verifying the score using official metrics collected by <span className="font-semibold text-gray-900">bond.credit</span>. 
                        The algorithm runs entirely within an <span className="font-semibold text-gray-900">iExec TEE (Trusted Execution Environment)</span>, 
                        which ensures that calculation is performed exactly as defined, without any possibility of data manipulation or external interference.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  TEE COMPUTATION POWERED BY IEXEC ON ARBITRUM ONE
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
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
    <div className="mb-10 font-sans">
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-visible">
        <table className="w-full font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  AUA
                  <Tooltip text="AUA means Asset Under Agent - The total balance managed by the agent.">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-[#1172E1]/20 flex items-center justify-center text-[10px] text-gray-600 hover:text-[#1172E1] transition-all cursor-help border border-gray-300 hover:border-[#1172E1]">
                      !
                    </span>
                  </Tooltip>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  AUM
                  <Tooltip text="AUM means Asset Under Management - The native USDC balance of the agent.">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-[#1172E1]/20 flex items-center justify-center text-[10px] text-gray-600 hover:text-[#1172E1] transition-all cursor-help border border-gray-300 hover:border-[#1172E1]">
                      !
                    </span>
                  </Tooltip>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Native Yield</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rewards</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Yield</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bond Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent, index) => (
              <LeaderboardRow 
                key={agent.agent} 
                agent={agent} 
                index={index}
                isExpanded={expandedAgentId === agent.agent}
                onToggle={() => toggleExpand(agent.agent)}
                calculatedScore={scores[agent.agent]}
                onScoreCalculated={(score) => handleScoreCalculated(agent.agent, score)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="block md:hidden space-y-3">
        {agents.map((agent, index) => (
          <LeaderboardRowMobile 
            key={agent.agent} 
            agent={agent}
            isExpanded={expandedAgentId === agent.agent}
            onToggle={() => toggleExpand(agent.agent)}
            calculatedScore={scores[agent.agent]}
          />
        ))}
      </div>
    </div>
  );
};

// Mobile Card Component
const LeaderboardRowMobile: React.FC<{
  agent: Agent;
  isExpanded: boolean;
  onToggle: () => void;
  calculatedScore?: number;
}> = ({ agent, isExpanded, onToggle, calculatedScore }) => {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toFixed(2)}`;
  };

  const getRankDisplay = (rank: number) => {
    const rankStyles = {
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-blue-50 text-blue-600',
      3: 'bg-gray-100 text-gray-700',
    };
    const style = rankStyles[rank as keyof typeof rankStyles] || 'bg-gray-50 text-gray-500';
    return (
      <span className={`w-8 h-8 rounded-full ${style} flex items-center justify-center text-sm font-bold`}>
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div 
        className="px-4 py-4"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRankDisplay(agent.rank)}
            {agent.medal && (
              <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
              </div>
            )}
            <p className="font-semibold text-gray-900 text-sm">{agent.agent}</p>
          </div>
          <div className="flex items-center gap-2">
            {calculatedScore ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#1172E1]/10 text-[#1172E1]">
                {calculatedScore}/100
              </span>
            ) : (
              <span className="text-xs text-gray-500">Tap to verify</span>
            )}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {!isExpanded && (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span className="text-gray-500">AUA:</span> <span className="text-[#1172E1] font-medium">{formatCurrency(agent.aua)}</span>
            </div>
            <div>
              <span className="text-gray-500">AUM:</span> <span className="text-gray-900 font-medium">{formatCurrency(agent.aum)}</span>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-gray-100 pt-3">
            <div><span className="text-gray-500">AUA:</span> <span className="text-[#1172E1] font-medium">{formatCurrency(agent.aua)}</span></div>
            <div><span className="text-gray-500">AUM:</span> <span className="text-gray-900 font-medium">{formatCurrency(agent.aum)}</span></div>
            <div><span className="text-gray-500">Native:</span> <span className="text-gray-900">{formatCurrency(agent.nativeYield)}</span></div>
            <div><span className="text-gray-500">Rewards:</span> <span className="text-gray-900">{formatCurrency(agent.rewards)}</span></div>
            <div><span className="text-gray-500">Exp. Yield:</span> <span className="text-gray-900">{agent.expectedYield || 'N/A'}</span></div>
            <div>
              <span className="text-gray-500">Score:</span>{' '}
              {calculatedScore ? (
                <span className="text-[#1172E1] font-semibold">{calculatedScore}/100</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="text-[#1172E1] font-medium"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoGrid;
