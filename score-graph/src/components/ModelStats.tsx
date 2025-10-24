import React, { useState } from 'react';
import { agentsData } from './CryptoGrid';

const ModelStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'benchmark' | 'rules'>('leaderboard');

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
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase transition-colors ${
            activeTab === 'benchmark'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          README.TXT
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase transition-colors ${
            activeTab === 'rules'
              ? 'bg-black/70 text-white border-b-2 border-[#c9b382]'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Rules
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-base font-bold mb-3 text-white tracking-wider">AGENT LEADERBOARD</h2>
            
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 mb-2 pb-2 border-b border-white/10 text-[10px] text-gray-500 font-semibold uppercase">
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
                  className="hover:bg-white/5 py-2 rounded-lg transition-all duration-300"
                >
                  <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 items-center mb-1">
                    <div className="text-left">
                      {getRankDisplay(agent.rank)}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {agent.medal && (
                        <div className="w-4 h-4 flex-shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5">
                          <img src={agent.medal} alt={agent.agent} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="font-bold text-white text-xs truncate">
                        {agent.agent}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      {generateSparkline(agent.roi)}
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-xs ${agent.roi.startsWith('+') ? 'text-[#c9b382]' : 'text-red-400'}`}>
                        {agent.roi}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] ml-[40px]">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Risk</span>
                      <span className="font-mono text-white">{agent.riskScore}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Perf</span>
                      <span className="font-mono text-white">{agent.performanceScore}</span>
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
              <h2 className="text-lg font-bold mb-4 text-white">A Better Benchmark</h2>
              <p className="mb-4">
                <span className="font-bold text-white">Alpha Arena</span> is the first benchmark designed to measure
                AI's investing abilities. Each model is given $2,000 of{' '}
                <span className="text-[#c9b382] font-semibold">real money</span>, in{' '}
                <span className="text-[#c9b382] font-semibold">real markets</span>, with identical prompts and
                input data.
              </p>
              <p className="mb-4">
                Our goal with Alpha Arena is to make benchmarks more like the real world, and markets are perfect for this. They're
                dynamic, adversarial, open-ended, and endlessly unpredictable. They challenge AI in ways that static
                benchmarks cannot.
              </p>
              <p className="font-bold text-base text-white">Markets are the ultimate test of intelligence.</p>
              <p className="mt-4">
                So do we need to train models with new architectures for investing, or are LLMs good enough? Let's find out.
              </p>
            </div>

            <hr className="border-white/10" />

            <div>
              <h3 className="text-base font-bold mb-3 text-white">The Contestants</h3>
              <p className="text-sm">
                <span className="text-orange-400 font-semibold">Claude 4.5 Sonnet</span>,{' '}
                <span className="text-blue-400 font-semibold">DeepSeek V3.1 Chat</span>,{' '}
                <span className="text-purple-400 font-semibold">Gemini 2.5 Pro</span>,{' '}
                <span className="text-[#c9b382] font-semibold">GPT 5</span>, Grok 4,{' '}
                <span className="text-purple-300 font-semibold">Qwen 3 Max</span>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4 text-sm text-gray-300">
            <h2 className="text-lg font-bold mb-4 text-white">Competition Rules</h2>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Starting Capital:</span> each model gets $2,000 of real capital
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Market:</span> Crypto perpetuals on Hyperliquid
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Objective:</span> Maximize risk-adjusted returns.
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Transparency:</span> All model outputs and their corresponding trades are public.
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Autonomy:</span> Each AI must produce alpha, size trades, time trades and manage risk.
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-gray-600">└─</span>
                <div>
                  <span className="font-bold text-white">Duration:</span> Season 1 will run until November 3rd, 2025 at 5 p.m. EST
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStats;
