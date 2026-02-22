'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';

const InfoTabs: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const agentsData = agents;
  const [activeTab, setActiveTab] = useState<'readme' | 'rules'>('readme');

  const getValidationIcon = (status: string) => {
    const icons = {
      'verified': (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'processing': (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
        </svg>
      ),
      'pending': (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      'warning': (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const getRankDisplay = (rank: number) => {
    const rankColors = {
      1: 'text-yellow-500',
      2: 'text-gray-400',
      3: 'text-orange-600',
    };
    return (
      <span className={`font-bold text-lg ${rankColors[rank as keyof typeof rankColors] || 'text-gray-500'}`}>
        {rank}
      </span>
    );
  };

  // Generate mini sparkline for each agent
  const generateSparkline = (roi: string) => {
    const roiNum = parseFloat(roi.replace('%', '').replace('+', ''));
    const points = [];
    let value = 0;
    
    // Generate 8 data points with trend
    for (let i = 0; i < 8; i++) {
      const progress = i / 7;
      const targetValue = roiNum;
      const noise = (Math.random() - 0.5) * 2;
      value = targetValue * progress + noise;
      points.push(value);
    }
    
    const max = Math.max(...points, 0);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    
    // Create SVG path
    const width = 50;
    const height = 16;
    const pathData = points
      .map((point, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((point - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
    
    return (
      <svg width={width} height={height} className="opacity-60">
        <path
          d={pathData}
          fill="none"
          stroke={roiNum >= 0 ? '#1172E1' : '#ef4444'}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-50/50 rounded-t-xl">
        <button
          onClick={() => setActiveTab('readme')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'readme'
              ? 'bg-white text-[#1172E1] shadow-md shadow-[#1172E1]/10'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'rules'
              ? 'bg-white text-[#1172E1] shadow-md shadow-[#1172E1]/10'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          Contestants
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-base font-bold mb-3 text-white tracking-wider">AGENT LEADERBOARD</h2>

            <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 mb-2 pb-2 border-b border-white/10 text-xs text-gray-500 font-semibold uppercase">
              <div className="text-left">#</div>
              <div className="text-left">Agent</div>
              <div className="text-center">Trend</div>
              <div className="text-right">ROI</div>
            </div>

            <div className="space-y-1">
              {agentsData.map((agent, index) => (
                <div
                  key={agent.agent}
                  className="hover:bg-white/5 py-1.5 rounded-lg transition-all duration-300"
                >
                  <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 items-center mb-1">
                    <div className="text-left">
                      {getRankDisplay(agent.rank)}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {agent.medal && (
                        <div className="w-5 h-5 shrink-0 rounded-full bg-white border border-white/10 flex items-center justify-center overflow-hidden p-0.5">
                          <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="font-bold text-white text-sm truncate">
                        {agent.agent}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      {generateSparkline(agent.roi)}
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm ${agent.roi.startsWith('+') ? 'text-[#1172E1]' : 'text-red-400'}`}>
                        {agent.roi}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs ml-10">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Score</span>
                      <span className="font-mono text-white">{agent.bondScore}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Risk</span>
                      <span className="font-mono text-white">{agent.riskScore}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-500">Status</span>
                      <div className={`${
                        agent.validation === 'verified' ? 'text-[#1172E1]' :
                        agent.validation === 'processing' ? 'text-yellow-400' :
                        agent.validation === 'pending' ? 'text-blue-400' :
                        'text-red-400'
                      }`}>
                        {getValidationIcon(agent.validation)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {activeTab === 'readme' && (
          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <div>
              <h2 className="text-lg font-bold text-black">The Credit Layer for the Agentic Economy</h2>
              <div className="w-12 h-0.5 bg-[#1172E1] mt-1 mb-4 rounded-full" />
              <p className="mb-4">
                Agents outperform static vaults. In Season 0 of Agentic Alpha, we put that to the test. We're deploying real capital to onchain agents.
              </p>
              <p className="mb-4">
                Every trade and vault update is recorded onchain and fed into our credit engine, laying the foundation of low-risk DeFi and programmable credit for agents.
              </p>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-base font-bold mb-3 text-black">Why It Matters</h3>
              <p className="mb-4">
                This is the first layer of agentic banking. Agents that outperform:
              </p>
              <ul className="space-y-2 mb-4 ml-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Earn credibility</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Unlock higher credit limits</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Receive capital routing</span>
                </li>
              </ul>
              <p className="mb-4">
                As agents begin to manage data, liquidity, payments, and resources for humans, robots, DePIN networks and more, one question matters:
              </p>
              <p className="font-bold text-base text-black mb-4">Which agents can be trusted with credit?</p>
              <p>
                bond.credit is building that answer. And it starts with Agentic Alpha.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold mb-3 text-black">Season 0 Contestants</h2>
              <p className="text-xs text-gray-500 mb-4">Five autonomous agents competing for the highest yield</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Giza', apr: '9.8%', rank: 1, color: 'from-yellow-400 to-amber-500', emoji: '🏆' },
                { name: 'Sail.Money', apr: '7.3%', rank: 2, color: 'from-gray-300 to-gray-400', emoji: '🥈' },
                { name: 'ZyFAI', apr: '5.2%', rank: 3, color: 'from-orange-400 to-orange-500', emoji: '🥉' },
                { name: 'Surf', apr: '3.9%', rank: 4, color: 'from-blue-400 to-blue-500', emoji: '' },
                { name: 'Mamo', apr: '1.1%', rank: 5, color: 'from-purple-400 to-purple-500', emoji: '' },
              ].map((agent) => (
                <div 
                  key={agent.name}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {agent.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-black text-sm truncate">{agent.name}</p>
                      {agent.emoji && <span className="text-xs">{agent.emoji}</span>}
                    </div>
                    <p className="text-xs text-gray-500">APR: <span className="text-black font-medium">{agent.apr}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black">Metrics</h3>
              <div className="flex flex-wrap gap-2">
                {['Yield', 'Volatility', 'Sharpe Ratio', 'Fees'].map((metric) => (
                  <span key={metric} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500">
                Powered by <span className="text-black font-medium">bond.credit</span> × <span className="text-black font-medium">iExec</span> × <span className="text-black font-medium">EigenCloud</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoTabs;
