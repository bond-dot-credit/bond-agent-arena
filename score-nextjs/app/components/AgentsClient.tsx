'use client';

import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LaunchIcon from '@mui/icons-material/Launch';
import { Agent } from '@/lib/types';
import Image from 'next/image';

interface AgentsClientProps {
  agents: Agent[];
}

const AgentsClient: React.FC<AgentsClientProps> = ({ agents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'high-yield' | 'low-risk'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredAgents = agents
    .filter(agent =>
      agent.agent.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(agent => {
      switch (activeFilter) {
        case 'verified':
          return agent.validation === 'verified';
        case 'high-yield':
          return parseFloat(agent.roi.replace('%', '').replace('+', '')) >= 0.05;
        case 'low-risk':
          return agent.riskScore <= 0.5;
        default:
          return true;
      }
    });

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#c9b382] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Agentic Yield Vaults
              </h1>
              <p className="text-lg text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                Explore autonomous stablecoin yield agents with verified performance
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Filter Tabs */}
          <div className="flex space-x-1 rounded-xl p-1.5 w-fit" style={{ backgroundColor: '#1A1A1A', boxShadow: '0 0 10px rgba(255,255,255,0.05)' }}>
            {[
              { key: 'all', label: 'All Agents' },
              { key: 'verified', label: 'Verified' },
              { key: 'high-yield', label: 'High Yield' },
              { key: 'low-risk', label: 'Low Risk' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-[#c9b382] text-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search and View Mode */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-64 rounded-xl focus:ring-2 focus:ring-[#c9b382] focus:border-transparent text-white placeholder-gray-400"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1A1A1A', boxShadow: '0 0 10px rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-[#c9b382] text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Card View"
              >
                <GridViewIcon sx={{ fontSize: 20 }} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-[#c9b382] text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Table View"
              >
                <ViewListIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'cards' ? (
          /* Agent Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.contractAddress} agent={agent} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1A1A', boxShadow: '0 0 10px rgba(255,255,255,0.05)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-lg font-semibold text-white">Agent Performance</h3>
              <p className="text-sm text-gray-300 mt-1">Ranked by performance score</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">ROI</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Risk Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Bond Score</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {filteredAgents.map((agent) => (
                    <tr key={agent.contractAddress} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td className="px-4 py-3">
                        <span className="text-lg font-bold text-white">#{agent.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {agent.medal && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={agent.medal}
                                alt={agent.agent}
                                width={32}
                                height={32}
                                className="object-contain w-full h-full"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-white">{agent.agent}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#E57373]">{agent.roi}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{(agent.riskScore * 100).toFixed(0)}%</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#64B5F6]">{agent.performanceScore.toFixed(1)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agent.validation === 'verified' ? 'bg-green-500/20 text-green-400' :
                          agent.validation === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          agent.validation === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {agent.validation}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#c9b382] font-medium">{agent.bondScore}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <SearchIcon sx={{ fontSize: 48 }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
            <p className="text-gray-300">Try adjusting your search or filter criteria.</p>
          </div>
        )}
    </div>
  );
};

// AgentCard component
interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getValidationColor = (validation: string) => {
    switch (validation) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'warning': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 0.3) return 'text-green-400';
    if (riskScore <= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.01]">
      <div className="text-white rounded-xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-xl duration-500 relative backdrop-blur-xl hover:border-[#c9b382]/30 overflow-hidden p-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9b382]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>
        <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            {agent.medal ? (
              <Image
                src={agent.medal}
                alt={agent.agent}
                width={48}
                height={48}
                className="object-contain w-full h-full"
                unoptimized
              />
            ) : (
              <span className="text-2xl">🤖</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-[#c9b382] transition-colors text-lg">
              {agent.agent}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getValidationColor(agent.validation)}`}>
                {agent.validation}
              </span>
              <span className="text-xs text-gray-400">
                Rank #{agent.rank}
              </span>
            </div>
          </div>
        </div>
        <LaunchIcon className="w-5 h-5 text-gray-400 group-hover:text-[#c9b382] transition-colors" />
      </div>

      <p className="text-sm text-gray-300 mb-4">
        {agent.vaultType} vault with autonomous yield optimization
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(229, 115, 115, 0.1)', border: '1px solid rgba(229, 115, 115, 0.2)' }}>
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUpIcon sx={{ fontSize: 16, color: '#E57373' }} />
            <span className="text-xs font-semibold text-[#E57373] uppercase">ROI</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{agent.roi}</div>
          <div className="text-xs text-[#E57373] font-medium">
            Total Return
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(100, 181, 246, 0.1)', border: '1px solid rgba(100, 181, 246, 0.2)' }}>
          <div className="flex items-center space-x-2 mb-1">
            <SecurityIcon sx={{ fontSize: 16, color: '#64B5F6' }} />
            <span className="text-xs font-semibold text-[#64B5F6] uppercase">Performance</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{agent.performanceScore.toFixed(1)}</div>
          <div className="text-xs text-[#64B5F6] font-medium">Score</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Risk Score</span>
          <span className={`text-sm font-medium ${getRiskColor(agent.riskScore)}`}>
            {(agent.riskScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${agent.riskScore * 100}%`,
              backgroundColor: agent.riskScore <= 0.3 ? '#4ade80' : agent.riskScore <= 0.6 ? '#fbbf24' : '#f87171'
            }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-sm text-white font-semibold">
          Bond Score: <span className="text-[#c9b382]">{agent.bondScore}</span>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsClient;
