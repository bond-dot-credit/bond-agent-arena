'use client';

import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Agent } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartViewProps {
  agentsData: Agent[];
  currentTimeframe: string;
  showDollar: boolean;
}

// Refined color palette for agents with better readability on dark backgrounds
const agentColors = [
  '#E57373', // Giza - Pink-red, warm tone
  '#64B5F6', // Sail - Bright blue
  '#FFD54F', // Almanak - Mustard yellow
  '#9575CD', // Mamo - Premium purple
  '#4DB6AC', // SurfLiquid - Cool teal
];

const BarChartView: React.FC<BarChartViewProps> = ({ agentsData, currentTimeframe, showDollar }) => {
  const [chartData, setChartData] = React.useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const labels: string[] = [];
      const values: number[] = [];
      const backgroundColors: string[] = [];
      const borderColors: string[] = [];

      await Promise.all(
        agentsData.map(async (agent, index) => {
          const response = await fetch(
            `/api/agents/${agent.contractAddress}/performance?interval=${currentTimeframe}`,
            { cache: 'no-store' }
          );

          if (response.ok) {
            const data = await response.json();

            const latestValue = data.currentValue;
            const baseValue = data.initialValue;

            // Calculate value to display
            const displayValue = showDollar
              ? latestValue
              : ((latestValue - baseValue) / baseValue) * 100;

            labels.push(agent.agent);
            values.push(displayValue);
            // Use 85% opacity (D9 in hex) for bars so background gradients peek through
            backgroundColors.push(agentColors[index % agentColors.length] + 'D9');
            borderColors.push(agentColors[index % agentColors.length]);
          }
        })
      );

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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        titleColor: '#c9b382',
        bodyColor: '#fff',
        borderColor: '#c9b382',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (showDollar) {
              return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
              return `${label}: ${value.toFixed(2)}%`;
            }
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: '#fff',
          font: {
            size: 12,
            family: 'Courier New, monospace',
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
        ticks: {
          color: '#fff',
          font: {
            size: 11,
            family: 'Courier New, monospace',
          },
          callback: function(value: any) {
            if (showDollar) {
              return '$' + value.toFixed(2);
            } else {
              return value.toFixed(2) + '%';
            }
          }
        },
        grid: {
          color: '#333333', // Subtle grid lines
          lineWidth: 0.5,
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
        <div className="text-white font-mono">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChartView;
