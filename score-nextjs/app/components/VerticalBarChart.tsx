'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';

const agentColors = [
  '#1172e1', // Sapphire - Primary blue
  '#1575e4', // Crayola - Lighter blue
  '#2c88f8', // Energy - Bright blue
  '#4da3f8', // Light sky blue
  '#1f5dba', // Darker blue for contrast
];

interface VerticalBarChartProps {
  agents: Agent[];
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ agents }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const agent = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-black/5 rounded-lg shadow-xl p-3"
        >
          <p className="text-sm font-semibold text-gray-700">{agent.name}</p>
          <p className="text-lg font-bold text-[#1172e1]">
            Agent Value: ${agent.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const data = agents.slice(0, 5).map((agent, index) => ({
    name: agent.agent,
    value: agent.aua || 2000,
    color: agentColors[index % agentColors.length],
  }));

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[maxValue * 0.8, maxValue * 1.1]}
            tickCount={5}
            tick={{ fontSize: 12 }}
            strokeDasharray="4 4"
            axisLine={false}
            tickLine={{ strokeDasharray: '4 4' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`}>
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  <div style={{ backgroundColor: entry.color }} />
                </motion.div>
              </Cell>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
