import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

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

const models: { [key: string]: ModelData } = {
  'GPT-5': { color: '#8b5cf6', icon: '🟣', value: 12619.44 },
  'Claude Sonnet 4.5': { color: '#ff6b35', icon: '🟠', value: 8537.88 },
  'Gemini 2.5 Pro': { color: '#4285F4', icon: '🔵', value: 11788.96 },
  'Grok 4': { color: '#000000', icon: '⚫', value: 8065.50 },
  'DeepSeek Chat v3.1': { color: '#4d6bfe', icon: '🔷', value: 3975.38 },
  'Qwen3 Max': { color: '#00ff88', icon: '🟢', value: 2757.90 },
  'BTC Buy & Hold': { color: '#5a5a5a', icon: '₿', value: 10000, dashed: true }
};

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

      for (let i = 0; i <= dataPoints; i++) {
        const date = new Date(now.getTime() - (dataPoints - i) * getTimeInterval(currentTimeframe));
        const time = date.getTime();

        const targetValue = model.value;
        const progress = i / dataPoints;

        const volatility = 0.02;
        const trendValue = baseValue + (targetValue - baseValue) * progress;
        const randomChange = (Math.random() - 0.5) * baseValue * volatility;
        const value = trendValue + randomChange;

        data.push({ time, value: Math.max(value, baseValue * 0.3) });
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
      .attr('stroke', 'rgba(0, 0, 0, 0.1)')
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
      .attr('stroke', 'rgba(0, 0, 0, 0.1)')
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
        .attr('stroke-width', 2)
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
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        iconGroup.append('text')
          .attr('x', 20)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10')
          .attr('fill', '#fff')
          .attr('font-weight', 'bold')
          .text(model.icon);

        iconGroup.append('text')
          .attr('x', 45)
          .attr('y', 4)
          .attr('font-size', '12')
          .attr('fill', '#000')
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
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
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
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-weight', '600');

    // Watermark
    g.append('text')
      .attr('x', chartWidth - 10)
      .attr('y', chartHeight - 10)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('fill', 'rgba(0, 0, 0, 0.3)')
      .attr('font-family', 'Courier New, monospace')
      .attr('font-weight', 'bold')
      .text('nof1.ai');

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
    <div className="bg-white border border-gray-200 rounded-lg p-5 relative">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">TOTAL ACCOUNT VALUE</h2>
          <div className="flex gap-1">
            <button
              className={`px-3 py-1 bg-gray-900 text-white rounded-md font-semibold text-sm ${showDollar ? 'bg-gray-900' : 'bg-gray-700'}`}
              onClick={() => handleValueToggle(true)}
            >
              $
            </button>
            <button
              className={`px-3 py-1 bg-gray-900 text-white rounded-md font-semibold text-sm ${!showDollar ? 'bg-gray-900' : 'bg-gray-700'}`}
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
              className={`px-4 py-2 bg-gray-900 text-white rounded-md font-semibold ${currentTimeframe === tf ? 'bg-gray-900' : 'bg-gray-700'}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-96">
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