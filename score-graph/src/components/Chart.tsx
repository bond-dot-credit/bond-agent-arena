import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { agentsData } from './CryptoGrid';

interface ModelData {
  color: string;
  icon: string;
  value: number;
  dashed?: boolean;
}

interface ChartPoint {
  time: number;
  value: number;
}

interface ChartData {
  [modelName: string]: ChartPoint[];
}

const agentColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

const models: { [key: string]: ModelData } = agentsData.reduce((acc, agent, index) => {
  const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
  const baseValue = 10000;
  const finalValue = baseValue * (1 + roiNum / 100);

  acc[agent.agent] = {
    color: agentColors[index % agentColors.length],
    icon: agent.medal || '🤖',
    value: finalValue
  };
  return acc;
}, {} as { [key: string]: ModelData });

const Chart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('72H');
  const [showDollar, setShowDollar] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartData>({});
  const [loading, setLoading] = useState<boolean>(true);

  const getDataPointsForTimeframe = useCallback((timeframe: string) => {
    switch (timeframe) {
      case '1H': return 12;
      case '24H': return 24;
      case '72H': return 36;
      case 'ALL': return 168;
      default: return 36;
    }
  }, []);

  const getTimeInterval = useCallback((timeframe: string) => {
    switch (timeframe) {
      case '1H': return 5 * 60 * 1000;
      case '24H': return 60 * 60 * 1000;
      case '72H': return 2 * 60 * 60 * 1000;
      case 'ALL': return 60 * 60 * 1000;
      default: return 2 * 60 * 60 * 1000;
    }
  }, []);

  const generateModelData = useCallback(() => {
    const now = new Date();
    const dataPoints = getDataPointsForTimeframe(currentTimeframe);
    const newChartData: ChartData = {};

    Object.keys(models).forEach(modelName => {
      const data: ChartPoint[] = [];
      const baseValue = 10000;
      const model = models[modelName];
      const targetValue = model.value;

      // Market-like volatility parameters
      const volatility = 0.015 + Math.random() * 0.01; // 1.5-2.5% volatility
      const trendStrength = 0.3 + Math.random() * 0.4;

      let currentValue = baseValue;
      let momentum = 0;

      for (let i = 0; i <= dataPoints; i++) {
        const date = new Date(now.getTime() - (dataPoints - i) * getTimeInterval(currentTimeframe));
        const time = date.getTime();
        const progress = i / dataPoints;

        // Expected value based on final ROI
        const expectedValue = baseValue + (targetValue - baseValue) * progress;

        // Add momentum-based movement (trending behavior)
        const drift = (expectedValue - currentValue) * trendStrength * 0.1;
        momentum = momentum * 0.7 + drift * 0.3;

        // Add volatility with autocorrelation
        const randomShock = (Math.random() - 0.5) * 2;
        const volatilityComponent = currentValue * volatility * randomShock;

        // Combine trend, momentum, and volatility
        const change = momentum + volatilityComponent;
        currentValue = currentValue + change;

        // Add occasional market events (spikes/dips)
        if (Math.random() < 0.05) {
          const eventMagnitude = (Math.random() - 0.5) * currentValue * 0.03;
          currentValue += eventMagnitude;
        }

        // Keep values reasonable
        currentValue = Math.max(currentValue, baseValue * 0.7);
        currentValue = Math.min(currentValue, baseValue * 1.5);

        data.push({ time, value: currentValue });
      }

      // Ensure last point converges to target
      const lastPoint = data[data.length - 1];
      const adjustment = (targetValue - lastPoint.value) / 5;
      for (let i = Math.max(0, data.length - 5); i < data.length; i++) {
        const weight = (i - (data.length - 5)) / 5;
        data[i].value += adjustment * weight;
      }

      newChartData[modelName] = data;
    });
    setChartData(newChartData);
    setLoading(false);
  }, [currentTimeframe, getDataPointsForTimeframe, getTimeInterval]);

  const createChart = useCallback(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 60, left: 80 };

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .html(''); // Clear previous chart

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allValues = Object.values(chartData).flat().map(d => d.value);
    const allTimes = Object.values(chartData).flat().map(d => d.time);

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    const xScale = d3.scaleLinear()
      .domain([minTime, maxTime])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([chartHeight, 0]);

    // Grid lines
    const yTicks = 7;
    g.selectAll('.grid-line-y')
      .data(d3.range(yTicks + 1))
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('y1', (d) => yScale(minValue + (maxValue - minValue) * (d / yTicks)))
      .attr('x2', chartWidth)
      .attr('y2', (d) => yScale(minValue + (maxValue - minValue) * (d / yTicks)))
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', '0.5')
      .attr('stroke-dasharray', '1,3');

    const xTicks = 6;
    g.selectAll('.grid-line-x')
      .data(d3.range(xTicks + 1))
      .enter()
      .append('line')
      .attr('class', 'grid-line-x')
      .attr('x1', (d) => (chartWidth / xTicks) * d)
      .attr('y1', 0)
      .attr('x2', (d) => (chartWidth / xTicks) * d)
      .attr('y2', chartHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', '0.5')
      .attr('stroke-dasharray', '1,3');

    // Model lines
    Object.entries(chartData).forEach(([modelName, data]) => {
      const lineGenerator = d3.line<ChartPoint>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value));

      const model = models[modelName];

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', model.color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-dasharray', model.dashed ? '5,5' : '0,0')
        .attr('d', lineGenerator);

      // Model icons and values at the end of each line
      if (data.length > 0) {
        const lastPoint = data[data.length - 1];
        const x = xScale(lastPoint.time);
        const y = yScale(lastPoint.value);

        const iconGroup = g.append('g')
          .attr('transform', `translate(${x}, ${y})`);

        iconGroup.append('circle')
          .attr('cx', 20)
          .attr('cy', 0)
          .attr('r', 12)
          .attr('fill', model.color)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);

        iconGroup.append('text')
          .attr('x', 20)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10')
          .attr('fill', '#000')
          .attr('font-weight', 'bold')
          .text(model.icon);

        iconGroup.append('text')
          .attr('x', 45)
          .attr('y', 4)
          .attr('font-size', '12')
          .attr('fill', '#fff')
          .attr('font-weight', '600')
          .attr('font-family', 'Courier New, monospace')
          .text(`$${model.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    });

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(yTicks)
      .tickFormat(d => `$${(d as number / 1000).toFixed(0)}K`)
      .tickSizeOuter(0);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select('.domain').remove()) // Remove the axis line
      .selectAll('text')
      .attr('font-size', '10')
      .attr('fill', 'rgba(255, 255, 255, 0.7)')
      .attr('font-family', 'Courier New, monospace')
      .attr('font-weight', '600');

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(xTicks)
      .tickFormat(d => d3.timeFormat('%b %d %H:%M')(new Date(d as number)))
      .tickSizeOuter(0);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .call(g => g.select('.domain').remove()) // Remove the axis line
      .selectAll('text')
      .attr('font-size', '8')
      .attr('fill', 'rgba(255, 255, 255, 0.7)')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-weight', '600');

    // Watermark
    g.append('text')
      .attr('x', chartWidth - 10)
      .attr('y', chartHeight - 10)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('fill', 'rgba(255, 255, 255, 0.2)')
      .attr('font-family', 'Courier New, monospace')
      .attr('font-weight', 'bold')
      .text('bond.credit');

  }, [chartData]);

  useEffect(() => {
    generateModelData();
    const interval = setInterval(generateModelData, 15000); // Update data every 15 seconds
    return () => clearInterval(interval);
  }, [generateModelData]);

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {
      createChart();
    }
  }, [chartData, createChart]);

  const handleTimeframeChange = (timeframe: string) => {
    setCurrentTimeframe(timeframe);
    setLoading(true);
  };

  const handleValueToggle = (isDollar: boolean) => {
    setShowDollar(isDollar);
    // Re-render chart with new value format
    createChart();
  };

  return (
    <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md border border-white/10 rounded-2xl p-6 relative shadow-2xl">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">TOTAL ACCOUNT VALUE</h2>
          <div className="flex gap-1">
            <button
              className={`px-3 py-1 rounded-md font-semibold text-sm transition-all ${showDollar ? 'bg-green-400 text-black' : 'bg-gray-800 text-gray-400'}`}
              onClick={() => handleValueToggle(true)}
            >
              $
            </button>
            <button
              className={`px-3 py-1 rounded-md font-semibold text-sm transition-all ${!showDollar ? 'bg-green-400 text-black' : 'bg-gray-800 text-gray-400'}`}
              onClick={() => handleValueToggle(false)}
            >
              %
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {['ALL', '72H', '24H', '1H'].map((tf) => (
            <button
              key={tf}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${currentTimeframe === tf ? 'bg-green-400 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-96 bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-4">
        <svg id="aiModelChart" ref={svgRef} width="100%" height="100%"></svg>
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="text-green-400 text-base font-semibold">Loading Chart Data...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;