'use client';

import React, { useEffect, useState } from 'react';
import { Agent } from '@/lib/types';

interface AgentValue {
  name: string;
  value: number;
  change24h: number;
}

const AgentCarousel: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const [agentValues, setAgentValues] = useState<AgentValue[]>([]);

  useEffect(() => {
    const fetchAgentValues = async () => {
      try {
        const values = await Promise.all(
          agents.map(async (agent) => {
            const response = await fetch(
              `/api/agents/${agent.contractAddress}/performance?interval=ALL`,
              { cache: 'no-store' }
            );

            if (response.ok) {
              const data = await response.json();
              const currentValue = data.currentValue || 2000;
              const baseValue = 2000;

              // Calculate total change from start ($2000)
              const totalChange = ((currentValue - baseValue) / baseValue) * 100;

              return {
                name: agent.agent,
                value: currentValue,
                change24h: totalChange
              };
            }

            return {
              name: agent.agent,
              value: 2000,
              change24h: 0
            };
          })
        );

        // Sort by ROI (highest to lowest)
        const sortedValues = values.sort((a, b) => b.change24h - a.change24h);
        setAgentValues(sortedValues);
      } catch (error) {
        console.error('Failed to fetch agent values:', error);
      }
    };

    fetchAgentValues();
    const interval = setInterval(fetchAgentValues, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [agents]);

  return (
    <div className="relative overflow-hidden mb-4 py-2 border-y border-[#c9b382]/20 bg-gradient-to-r from-black/50 via-[#c9b382]/5 to-black/50">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex items-center justify-center gap-12">
          {agentValues.map((agent) => (
            <div key={agent.name} className="flex items-center gap-3">
              <span className="text-[#c9b382] font-bold text-sm">{agent.name}</span>
              <span className="text-white font-mono text-sm">
                ${agent.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold ${agent.change24h >= 0 ? 'text-[#c9b382]' : 'text-red-400'}`}>
                {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;
