'use client';

import React, { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Agent } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartViewProps {
  agentsData: Agent[];
  currentTimeframe: string;
  showDollar: boolean;
}

// Watchtower agent color palette
const agentColors = [
  '#ccff00', // Giza/Arma   - lime
  '#3b82f6', // Sail.Money  - blue
  '#a855f7', // ZyFAI       - purple
  '#f97316', // Surf        - orange
  '#22c55e', // Mamo        - green
];

const BarChartView: React.FC<BarChartViewProps> = ({ agentsData, currentTimeframe, showDollar }) => {
  const [chartData, setChartData] = React.useState<any>(null);

  // Watermark plugin for Chart.js
  const watermarkPlugin = {
    id: 'watermark',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const rightX = chartArea.right - 15; // Position near the right edge
      const topY = chartArea.top + 20; // Position near the top

      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ccff00';
      ctx.font = 'bold 28px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('bond.credit / agentic alpha', rightX, topY);
      ctx.restore();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Create arrays to store results in order
      const results = await Promise.all(
        agentsData.map(async (agent, index) => {
          const response = await fetch(
            `/api/agents/${agent.contractAddress}/performance?interval=${currentTimeframe}`,
            { cache: 'no-store' }
          );

          if (response.ok) {
            const data = await response.json();
            const latestValue = data.currentValue;
            const displayValue = latestValue;

            return {
              label: agent.agent,
              value: displayValue,
              backgroundColor: agentColors[index % agentColors.length] + 'D9',
              borderColor: agentColors[index % agentColors.length],
              rank: agent.rank
            };
          }
          return null;
        })
      );

      // Filter out null results and sort by rank to maintain consistent order
      const validResults = results.filter(r => r !== null).sort((a, b) => a!.rank - b!.rank);

      const labels = validResults.map(r => r!.label);
      const values = validResults.map(r => r!.value);
      const backgroundColors = validResults.map(r => r!.backgroundColor);
      const borderColors = validResults.map(r => r!.borderColor);

      setChartData({
        labels: labels,
        datasets: [{
          label: 'Agent Value',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8,
        }],
      });
    };

    fetchData();
  }, [agentsData, currentTimeframe, showDollar]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since bars are labeled on X-axis
      },
      tooltip: {
        backgroundColor: 'rgba(17,17,17,0.97)',
        titleColor: '#ccff00',
        bodyColor: '#a1a1aa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            // Always show dollar values only
            return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            // if (showDollar) {
            //   return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            // } else {
            //   return `${label}: ${value.toFixed(2)}%`;
            // }
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: '#a1a1aa',
          font: {
            size: 11,
            family: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            weight: 'bold' as const,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        min: 2000,
        ticks: {
          color: '#71717a',
          font: {
            size: 10,
            family: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          },
          callback: function(value: any) {
            // Always show dollar values only
            return '$' + value.toFixed(2);
            // if (showDollar) {
            //   return '$' + value.toFixed(2);
            // } else {
            //   // Use more decimal places for small percentage values
            //   const absValue = Math.abs(value);
            //   if (absValue < 1) {
            //     return value.toFixed(3) + '%';
            //   } else if (absValue < 10) {
            //     return value.toFixed(2) + '%';
            //   } else {
            //     return value.toFixed(1) + '%';
            //   }
            // }
          }
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          lineWidth: 1,
        },
        border: {
          display: false,
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[550px]">
        <div style={{ color: 'var(--s2)', fontFamily: 'var(--mono)', fontSize: '0.8125rem' }}>Loading chart data…</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Bar data={chartData} options={options} plugins={[watermarkPlugin]} />
    </div>
  );
};

export default BarChartView;
