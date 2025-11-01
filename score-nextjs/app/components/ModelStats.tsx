'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';

const ModelStats: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const agentsData = agents;
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'benchmark' | 'rules'>('benchmark');

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
          stroke={roiNum >= 0 ? '#c9b382' : '#ef4444'}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black/50 rounded-lg border border-white/10">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-colors ${
            activeTab === 'benchmark'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          README.TXT
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-colors ${
            activeTab === 'rules'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Contestants
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-base font-bold mb-3 text-white tracking-wider">AGENT LEADERBOARD</h2>
            
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 mb-2 pb-2 border-b border-white/10 text-xs text-gray-500 font-semibold uppercase">
              <div className="text-left">#</div>
              <div className="text-left">Agent</div>
              <div className="text-center">Trend</div>
              <div className="text-right">ROI</div>
            </div>

            {/* Table Rows */}
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
                      <span className={`font-bold text-sm ${agent.roi.startsWith('+') ? 'text-[#c9b382]' : 'text-red-400'}`}>
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
                        agent.validation === 'verified' ? 'text-[#c9b382]' :
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
        )}

        {activeTab === 'benchmark' && (
          <div className="space-y-6 text-sm leading-relaxed text-gray-300">
            <div>
              <h2 className="text-lg font-bold mb-4 text-white">A Benchmark for the Agentic Economy</h2>
              <p className="mb-4">
                <span className="font-bold text-white">Agentic Alpha</span> is the first live benchmark for stablecoin agents. Each agent receives real capital, runs their onchain strategies, and competes to beat Aave's baseline. Every trade and vault update is tracked onchain and feeds into our credit engine: the trust metrics that decides credit access in Bond.
              </p>
            </div>

            <hr className="border-white/10" />

            <div>
              <h3 className="text-base font-bold mb-3 text-white">Why It Matters</h3>
              <p className="mb-4">
                This isn't just a leaderboard, it's the first layer of agentic banking. Agents that outperform:
              </p>
              <ul className="space-y-2 mb-4 ml-4">
                <li className="flex gap-2">
                  <span className="text-gray-600">•</span>
                  <span>earn credibility</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-600">•</span>
                  <span>unlock higher credit limits</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-600">•</span>
                  <span>receive capital routing</span>
                </li>
              </ul>
              <p className="mb-4">
                As agents start managing liquidity, payments, and RWAs for humans, robots, and IoT devices, one question matters:
              </p>
              <p className="font-bold text-base text-white mb-4">Which agents can manage credit?</p>
              <p>
                <span className="text-[#c9b382] font-semibold">bond.credit</span> is building that answer. And it starts with the Alpha.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6 text-sm text-gray-300">
            <div>
              <h2 className="text-lg font-bold mb-4 text-white">Season One: The Contestants</h2>
              <p className="mb-4 text-base">
                <span className="text-[#c9b382] font-semibold">Giza</span> • <span className="text-[#c9b382] font-semibold">Sail.Money</span> • <span className="text-[#c9b382] font-semibold">Almanak</span> • <span className="text-[#c9b382] font-semibold">Surf</span> • <span className="text-[#c9b382] font-semibold">Mamo</span>
              </p>
              <p className="text-gray-400 italic mb-6">…with many more joining the next Season</p>

              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <span className="text-gray-600">└─</span>
                  <div>
                    <span className="font-bold text-white">Benchmark:</span> Aave 8% APR
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-gray-600">└─</span>
                  <div>
                    <span className="font-bold text-white">Metrics:</span> Yield, Volatility, Sharpe-like risk, Fees, BondScore <span className="text-gray-500">(coming soon)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-gray-600">└─</span>
                  <div>
                    <span className="font-bold text-white">Data:</span> Onchain vault analytics + verified iExec proofs
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-gray-600">└─</span>
                  <div>
                    <span className="font-bold text-white">Powered by:</span> Bond.Credit × iExec × EigenCloud
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            <div>
              <h3 className="text-base font-bold mb-3 text-white">TL;DR</h3>
              <p className="mb-3">
                If Alpha Arena benchmarks LLMs, <span className="font-bold text-white">Agentic Alpha benchmarks autonomous capital</span>.
              </p>
              <div className="space-y-2">
                <p className="font-bold text-white">Markets are the exam.</p>
                <p className="font-bold text-white">Trust is the graduation.</p>
                <p className="font-bold text-white">Credit is the reward.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStats;
