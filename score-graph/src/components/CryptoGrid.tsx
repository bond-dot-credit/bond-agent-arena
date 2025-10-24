import React from 'react';

export interface Agent {
  rank: number;
  agent: string;
  vaultType: string;
  roi: string;
  riskScore: number;
  validation: string;
  performanceScore: number;
  bondScore: string;
  medal?: string;
}

export const agentsData: Agent[] = [
  { rank: 1, agent: 'Giza', vaultType: 'Stablecoin yield', roi: '+9.8%', riskScore: 0.92, validation: 'verified', performanceScore: 88.4, bondScore: '+4.2', medal: '/giza_logo.ico' },
  { rank: 2, agent: 'Sail.Money', vaultType: 'Stablecoin yield', roi: '+7.3%', riskScore: 0.87, validation: 'processing', performanceScore: 83.1, bondScore: '+2.1', medal: '/sale_money_logo.ico' },
  { rank: 3, agent: 'Almanac', vaultType: 'Stablecoin yield', roi: '+5.2%', riskScore: 0.94, validation: 'verified', performanceScore: 81.7, bondScore: '+1.3', medal: '/almanak_logo.ico' },
  { rank: 4, agent: 'Surf', vaultType: 'Stablecoin yield', roi: '+3.9%', riskScore: 0.80, validation: 'pending', performanceScore: 74.9, bondScore: '+0.8' },
  { rank: 5, agent: 'Mamo', vaultType: 'Stablecoin yield', roi: '+1.1%', riskScore: 0.71, validation: 'warning', performanceScore: 69.3, bondScore: '-2.4', medal: '/mamo_agent.ico' },
];

const LeaderboardRow: React.FC<{ agent: Agent; index: number }> = ({ agent, index }) => {
  const getValidationBadge = (status: string) => {
    const badges = {
      'verified': { bg: 'bg-[#c9b382]/20', text: 'text-[#c9b382]', border: 'border-[#c9b382]/30', label: 'Verified' },
      'processing': { bg: 'bg-yellow-400/20', text: 'text-yellow-400', border: 'border-yellow-400/30', label: 'Processing' },
      'pending': { bg: 'bg-blue-400/20', text: 'text-blue-400', border: 'border-blue-400/30', label: 'Pending' },
      'warning': { bg: 'bg-red-400/20', text: 'text-red-400', border: 'border-red-400/30', label: 'Warning' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const getRankBadge = (rank: number, logoUrl?: string) => {
    if (logoUrl) {
      return (
        <div className="w-10 h-10 rounded-full bg-white border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
          <img src={logoUrl} alt={`Rank ${rank}`} className="w-full h-full object-contain" />
        </div>
      );
    }
    if (rank === 1) return <span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-black">1</span>;
    if (rank === 2) return <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-xs font-bold text-black">2</span>;
    if (rank === 3) return <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-black">3</span>;
    return <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">{rank}</span>;
  };

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.01]">
      <div className="text-white rounded-xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-xl duration-500 relative backdrop-blur-xl hover:border-[#c9b382]/30 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9b382]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>
        <div className="px-6 py-4 relative z-10 grid grid-cols-8 gap-6 items-center">
          {/* Rank */}
          <div className="flex items-center justify-center">
            {getRankBadge(agent.rank, agent.medal)}
          </div>

          {/* Agent */}
          <div className="col-span-1">
            <p className="font-bold text-white group-hover:text-[#c9b382] transition-colors duration-300 text-base">{agent.agent}</p>
          </div>

          {/* Vault Type */}
          <div className="col-span-1">
            <p className="text-sm text-gray-400">{agent.vaultType}</p>
          </div>

          {/* ROI */}
          <div className="text-center">
            <p className={`font-bold text-base ${agent.roi.startsWith('+') ? 'text-[#c9b382]' : 'text-red-400'}`}>
              {agent.roi}
            </p>
          </div>

          {/* Risk Score */}
          <div>
            <div className="flex flex-col gap-1">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c9b382] to-[#e0c896] transition-all duration-500"
                  style={{ width: `${agent.riskScore * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">{agent.riskScore}</span>
            </div>
          </div>

          {/* Validation */}
          <div className="flex justify-center">
            {getValidationBadge(agent.validation)}
          </div>

          {/* Performance Score */}
          <div className="text-center">
            <p className="font-bold text-white font-mono text-base">{agent.performanceScore}</p>
          </div>

          {/* Bond Score */}
          <div className="text-center">
            <p className={`font-bold font-mono text-base ${agent.bondScore.startsWith('+') ? 'text-[#c9b382]' : agent.bondScore.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
              {agent.bondScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CryptoGrid: React.FC = () => {
  return (
    <div className="mb-10">
      {/* Table Header */}
      <div className="mb-4 px-6">
        <div className="grid grid-cols-8 gap-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="text-center">Rank</div>
          <div>Agent</div>
          <div>Vault Type</div>
          <div className="text-center">ROI</div>
          <div>Risk Score</div>
          <div className="text-center">Validation</div>
          <div className="text-center">Performance</div>
          <div className="text-center">Bond Score</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {agentsData.map((agent, index) => (
          <LeaderboardRow key={agent.rank} agent={agent} index={index} />
        ))}
      </div>
    </div>
  );
};

export default CryptoGrid;
