'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Agent } from '@/lib/types';

interface ModelData {
  color: string;
  icon: string;
  value: number;
  dashed?: boolean;
}

interface ChartPoint {
  time: number;
  value: number;
  isTradePoint?: boolean;
  tradeType?: 'buy' | 'sell';
  tradeNote?: string;
}

interface ChartData {
  [modelName: string]: ChartPoint[];
}

const agentColors = ['#c9b382', '#d4a574', '#b89968', '#e0c896', '#a88a5e'];

// Simulated yield events showing how agents generate stablecoin returns
const generateYieldEvents = (dataPoints: ChartPoint[], agentName: string): ChartPoint[] => {
  const events = [...dataPoints];

  // Limit to max 5 yield events to avoid performance issues
  const maxEvents = Math.min(5, Math.floor(dataPoints.length / 8));
  const eventFrequency = Math.floor(dataPoints.length / maxEvents);

  for (let i = eventFrequency; i < events.length && maxEvents > 0; i += eventFrequency) {
    if (Math.random() > 0.5) { // 50% chance of yield event
      const valueChange = i > 0 ? events[i].value - events[i-1].value : 0;
      const isPositive = valueChange >= 0;

      const yieldNotes = {
        positive: [
          'Yield harvested • +$' + Math.abs(valueChange).toFixed(2),
          'Staking rewards claimed',
          'LP fees earned',
        ],
        negative: [
          'Rebalancing fees',
          'Gas costs',
        ]
      };

      events[i] = {
        ...events[i],
        isTradePoint: true,
        tradeType: isPositive ? 'buy' : 'sell',
        tradeNote: isPositive
          ? yieldNotes.positive[Math.floor(Math.random() * yieldNotes.positive.length)]
          : yieldNotes.negative[Math.floor(Math.random() * yieldNotes.negative.length)]
      };
    }
  }

  return events;
};

const ChartWithData: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const agentsData = agents;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('24H');
  const [showDollar, setShowDollar] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartData>({});
  const [loading, setLoading] = useState<boolean>(true);

  const models: { [key: string]: ModelData } = agentsData.reduce((acc, agent, index) => {
    const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
    const baseValue = 2000;
    const finalValue = baseValue * (1 + roiNum / 100);

    acc[agent.agent] = {
      color: agentColors[index % agentColors.length],
      icon: agent.medal || '🤖',
      value: finalValue
    };
    return acc;
  }, {} as { [key: string]: ModelData });

  const getDataPointsForTimeframe = useCallback((timeframe: string) => {
    switch (timeframe) {
      case '1H': return 12;
      case '24H': return 24;
      case '72H': return 72;
      case 'ALL': return 168;
      default: return 72;
    }
  }, []);

  const getTimeInterval = useCallback((timeframe: string) => {
    switch (timeframe) {
      case '1H': return 5 * 60 * 1000;
      case '24H': return 60 * 60 * 1000;
      case '72H': return 60 * 60 * 1000;
      case 'ALL': return 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }, []);

  const fetchAgentData = useCallback(async () => {
    setLoading(true);
    const newChartData: ChartData = {};

    try {
      await Promise.all(
        agentsData.map(async (agent) => {
          const response = await fetch(
            `/api/agents/${agent.contractAddress}/performance?interval=${currentTimeframe}`,
            { cache: 'no-store' } // Force fresh data
          );

          if (response.ok) {
            const data = await response.json();
            const points: ChartPoint[] = data.snapshots.map((snap: any) => ({
              time: snap.timestamp,
              value: snap.totalValueUsd,
            }));

            // Add yield event annotations
            newChartData[agent.agent] = generateYieldEvents(points, agent.agent);
          }
        })
      );

      setChartData(newChartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [agentsData, currentTimeframe]);

  const createChart = useCallback(() => {
    if (!svgRef.current || Object.keys(chartData).length === 0) return;

    // Debounce chart creation to avoid rapid re-renders
    const width = 1000;
    const height = 550;
    const margin = { top: 15, right: 140, bottom: 50, left: 55 };

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Clear previous chart - use remove() instead of html('')
    svg.selectAll('g').remove();
    svg.selectAll('defs').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allTimes = Object.values(chartData).flat().map(d => d.time);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    const xScale = d3.scaleLinear()
      .domain([minTime, maxTime])
      .range([0, chartWidth]);

    let yScale: d3.ScaleLinear<number, number>;
    let minValue: number;
    let maxValue: number;

    if (showDollar) {
      // Dollar view: show absolute values
      const allValues = Object.values(chartData).flat().map(d => d.value);
      minValue = Math.min(...allValues) * 0.995;
      maxValue = Math.max(...allValues) * 1.005;
      yScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([chartHeight, 0]);
    } else {
      // Percentage view: calculate ROI %
      const baseValue = 2000;
      const allRoiPercents = Object.values(chartData).flat().map(d => ((d.value - baseValue) / baseValue) * 100);
      minValue = Math.min(...allRoiPercents) * 0.95;
      maxValue = Math.max(...allRoiPercents) * 1.05;
      yScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([chartHeight, 0]);
    }

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

    // Benchmark line (8% Aave base yield)
    const benchmarkValue = showDollar ? 2000 * 1.08 : 8;
    g.append('line')
      .attr('x1', 0)
      .attr('y1', yScale(benchmarkValue))
      .attr('x2', chartWidth)
      .attr('y2', yScale(benchmarkValue))
      .attr('stroke', '#c9b382')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.4);

    g.append('text')
      .attr('x', chartWidth - 10)
      .attr('y', yScale(benchmarkValue) - 5)
      .attr('text-anchor', 'end')
      .attr('font-size', '11')
      .attr('fill', '#c9b382')
      .attr('font-family', 'Courier New, monospace')
      .attr('font-weight', 'bold')
      .attr('opacity', 0.6)
      .text('Aave 8% Benchmark');

    // Model lines and trade points
    Object.entries(chartData).forEach(([modelName, data]) => {
      const model = models[modelName];
      const baseValue = 2000;

      // Use curve interpolation for smooth, natural-looking lines
      const lineGenerator = d3.line<ChartPoint>()
        .x(d => xScale(d.time))
        .y(d => {
          if (showDollar) {
            return yScale(d.value);
          } else {
            // Convert to ROI %
            const roiPercent = ((d.value - baseValue) / baseValue) * 100;
            return yScale(roiPercent);
          }
        })
        .curve(d3.curveMonotoneX); // Smooth curve that preserves monotonicity

      // Draw line with smooth curves
      const linePath = g.append('path')
        .datum(data)
        .attr('class', `line-${modelName.replace(/[\s.]+/g, '-')}`)
        .attr('fill', 'none')
        .attr('stroke', model.color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGenerator)
        .attr('opacity', 1);

      // Draw yield event markers with proper hover
      data.forEach(point => {
        if (point.isTradePoint) {
          const x = xScale(point.time);
          const y = showDollar
            ? yScale(point.value)
            : yScale(((point.value - baseValue) / baseValue) * 100);

          const markerGroup = g.append('g')
            .attr('class', 'yield-marker')
            .style('cursor', 'pointer')
            .style('pointer-events', 'all');

          // Small indicator line pointing up for gains, down for costs
          markerGroup.append('line')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', x)
            .attr('y2', point.tradeType === 'buy' ? y + 15 : y - 15)
            .attr('stroke', point.tradeType === 'buy' ? '#10b981' : '#ef4444')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.6);

          // Yield event marker circle
          const circle = markerGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', point.tradeType === 'buy' ? '#10b981' : '#ef4444')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);

          // Tooltip background
          const tooltip = markerGroup.append('g')
            .attr('class', 'tooltip')
            .attr('opacity', 0)
            .attr('pointer-events', 'none');

          const tooltipBg = tooltip.append('rect')
            .attr('x', x + 10)
            .attr('y', y - 35)
            .attr('rx', 4)
            .attr('fill', 'rgba(0, 0, 0, 0.9)')
            .attr('stroke', point.tradeType === 'buy' ? '#10b981' : '#ef4444')
            .attr('stroke-width', 1);

          const tooltipText = tooltip.append('text')
            .attr('x', x + 15)
            .attr('y', y - 20)
            .attr('fill', '#fff')
            .attr('font-size', '11')
            .attr('font-family', 'Courier New, monospace')
            .text(`${point.tradeNote}`);

          const tooltipValue = tooltip.append('text')
            .attr('x', x + 15)
            .attr('y', y - 8)
            .attr('fill', '#c9b382')
            .attr('font-size', '10')
            .attr('font-weight', 'bold')
            .attr('font-family', 'Courier New, monospace')
            .text(`Total: $${point.value.toFixed(2)}`);

          // Calculate tooltip background size
          const textBBox = (tooltipText.node() as SVGTextElement).getBBox();
          const valueBBox = (tooltipValue.node() as SVGTextElement).getBBox();
          const maxWidth = Math.max(textBBox.width, valueBBox.width);
          tooltipBg
            .attr('width', maxWidth + 10)
            .attr('height', 30);

          // Hover events
          markerGroup
            .on('mouseenter', function() {
              circle
                .transition()
                .duration(200)
                .attr('r', 6);
              tooltip
                .transition()
                .duration(200)
                .attr('opacity', 1);
            })
            .on('mouseleave', function() {
              circle
                .transition()
                .duration(200)
                .attr('r', 4);
              tooltip
                .transition()
                .duration(200)
                .attr('opacity', 0);
            });
        }
      });

      // Model icon at end of line with live fluctuation
      if (data.length > 0) {
        const lastPoint = data[data.length - 1];
        const x = xScale(lastPoint.time);
        const y = showDollar
          ? yScale(lastPoint.value)
          : yScale(((lastPoint.value - baseValue) / baseValue) * 100);

        const iconGroup = g.append('g')
          .attr('transform', `translate(${x}, ${y})`);

        // Subtle position fluctuation for live effect
        const fluctuate = () => {
          const offsetY = (Math.random() - 0.5) * 3;
          iconGroup
            .transition()
            .duration(2000 + Math.random() * 1000)
            .attr('transform', `translate(${x}, ${y + offsetY})`)
            .on('end', fluctuate);
        };
        fluctuate();

        if (model.icon && model.icon.startsWith('/')) {
          // Golden shimmer radial gradient
          const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
          const gradientId = `shimmer-${modelName.replace(/\s+/g, '-')}`;

          // Create radial gradient for shimmer
          const radialGradient = defs.append('radialGradient')
            .attr('id', gradientId);

          radialGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#f4e4c1');

          radialGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#d4a574');

          radialGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#c9b382');

          // Pulsing golden glow behind logo
          const glowCircle = iconGroup.append('circle')
            .attr('cx', 20)
            .attr('cy', 0)
            .attr('r', 18)
            .attr('fill', `url(#${gradientId})`)
            .attr('opacity', 0.4);

          // Animate glow pulse
          const pulseGlow = () => {
            glowCircle
              .transition()
              .duration(2000)
              .attr('r', 22)
              .attr('opacity', 0.2)
              .transition()
              .duration(2000)
              .attr('r', 18)
              .attr('opacity', 0.4)
              .on('end', pulseGlow);
          };
          pulseGlow();

          const logoCircle = iconGroup.append('circle')
            .attr('cx', 20)
            .attr('cy', 0)
            .attr('r', 16)
            .attr('fill', 'white')
            .attr('stroke', '#c9b382')
            .attr('stroke-width', 2.5);

          // Animate stroke color shimmer
          const shimmerStroke = () => {
            logoCircle
              .transition()
              .duration(1500)
              .attr('stroke', '#f4e4c1')
              .transition()
              .duration(1500)
              .attr('stroke', '#c9b382')
              .on('end', shimmerStroke);
          };
          shimmerStroke();

          iconGroup.append('image')
            .attr('x', 20 - 12)
            .attr('y', -12)
            .attr('width', 24)
            .attr('height', 24)
            .attr('href', model.icon)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        }

        const displayValue = showDollar
          ? `$${model.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${(((model.value - 2000) / 2000) * 100).toFixed(2)}%`;

        iconGroup.append('text')
          .attr('x', 45)
          .attr('y', 4)
          .attr('font-size', '12')
          .attr('fill', '#fff')
          .attr('font-weight', '600')
          .attr('font-family', 'Courier New, monospace')
          .text(displayValue);
      }
    });

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(yTicks)
      .tickFormat(d => showDollar ? `$${(d as number).toFixed(0)}` : `${(d as number).toFixed(1)}%`)
      .tickSizeOuter(0);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select('.domain').remove())
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
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '8')
      .attr('fill', 'rgba(255, 255, 255, 0.7)')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-weight', '600');

    // Create overlay for mouse tracking at the END (higher z-index)
    // This will be appended later after all chart elements

    // Add hover crosshair and tooltips
    const baseValue = 2000;
    const crosshairGroup = g.append('g')
      .attr('class', 'crosshair')
      .style('display', 'none')
      .style('pointer-events', 'none'); // Don't block hover events

    const verticalLine = crosshairGroup.append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    const tooltipGroup = crosshairGroup.append('g')
      .attr('class', 'tooltip-group');

    // Watermark
    g.append('text')
      .attr('x', chartWidth - 10)
      .attr('y', chartHeight - 10)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('fill', 'rgba(255, 255, 255, 0.2)')
      .attr('font-family', 'Courier New, monospace')
      .attr('font-weight', 'bold')
      .text('bond.credit')
      .style('pointer-events', 'none');

    // NOW add overlay after all elements are drawn
    const overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .lower(); // Move to back so it doesn't block yield markers

    overlay
      .on('mousemove', function(event) {
        const [mouseX, mouseY] = d3.pointer(event, this);
        const xTime = xScale.invert(mouseX);
        const yValue = yScale.invert(mouseY);

        // Find closest data point for each model and calculate distance from mouse
        const tooltipData: Array<{modelName: string, value: number, color: string, distance: number}> = [];

        Object.entries(chartData).forEach(([modelName, data]) => {
          // Find closest point
          let closestPoint = data[0];
          let minDist = Math.abs(data[0].time - xTime);

          data.forEach(point => {
            const dist = Math.abs(point.time - xTime);
            if (dist < minDist) {
              minDist = dist;
              closestPoint = point;
            }
          });

          // Calculate Y distance from mouse to this line
          const pointYValue = showDollar
            ? closestPoint.value
            : ((closestPoint.value - baseValue) / baseValue) * 100;
          const yDistance = Math.abs(pointYValue - yValue);

          tooltipData.push({
            modelName,
            value: closestPoint.value,
            color: models[modelName].color,
            distance: yDistance
          });
        });

        // Sort by distance to find the closest line
        tooltipData.sort((a, b) => a.distance - b.distance);
        const closestAgent = tooltipData[0];

        // Dim all lines
        svg.selectAll('path[class^="line-"]')
          .attr('opacity', 0.2)
          .attr('stroke-width', 3)
          .style('filter', 'none');

        // Highlight only the closest hovered line with glow
        const hoveredLine = svg.select(`.line-${closestAgent.modelName.replace(/[\s.]+/g, '-')}`);
        hoveredLine
          .attr('opacity', 1)
          .attr('stroke-width', 4)
          .style('filter', `drop-shadow(0 0 8px ${closestAgent.color})`);

        // Show crosshair
        crosshairGroup.style('display', null);
        verticalLine.attr('x1', mouseX).attr('x2', mouseX);

        // Clear previous tooltips
        tooltipGroup.selectAll('*').remove();

        // Draw tooltip only for the closest agent
        const yPos = showDollar
          ? yScale(closestAgent.value)
          : yScale(((closestAgent.value - baseValue) / baseValue) * 100);

        // Tooltip circle
        tooltipGroup.append('circle')
          .attr('cx', mouseX)
          .attr('cy', yPos)
          .attr('r', 6)
          .attr('fill', closestAgent.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Tooltip box with agent name in color
        const displayValue = showDollar
          ? `$${closestAgent.value.toFixed(2)}`
          : `${(((closestAgent.value - baseValue) / baseValue) * 100).toFixed(2)}%`;

        const textBg = tooltipGroup.append('rect')
          .attr('x', mouseX + 10)
          .attr('y', yPos - 20)
          .attr('rx', 4)
          .attr('fill', 'rgba(0, 0, 0, 0.95)')
          .attr('stroke', closestAgent.color)
          .attr('stroke-width', 2);

        const agentNameText = tooltipGroup.append('text')
          .attr('x', mouseX + 15)
          .attr('y', yPos - 5)
          .attr('fill', closestAgent.color)
          .attr('font-size', '12')
          .attr('font-weight', 'bold')
          .attr('font-family', 'Courier New, monospace')
          .text(closestAgent.modelName);

        const valueText = tooltipGroup.append('text')
          .attr('x', mouseX + 15 + (agentNameText.node() as SVGTextElement).getBBox().width + 5)
          .attr('y', yPos - 5)
          .attr('fill', '#fff')
          .attr('font-size', '12')
          .attr('font-family', 'Courier New, monospace')
          .text(displayValue);

        const totalWidth = (agentNameText.node() as SVGTextElement).getBBox().width + (valueText.node() as SVGTextElement).getBBox().width;
        textBg
          .attr('width', totalWidth + 15)
          .attr('height', 20);
      })
      .on('mouseleave', function() {
        crosshairGroup.style('display', 'none');
        // Restore all lines to full opacity and remove effects
        svg.selectAll('path[class^="line-"]')
          .attr('opacity', 1)
          .attr('stroke-width', 3)
          .style('filter', 'none');
      });

  }, [chartData, models, showDollar]);

  useEffect(() => {
    fetchAgentData();
  }, [currentTimeframe]); // Only re-fetch when timeframe changes

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {
      // Use requestAnimationFrame to avoid blocking UI
      requestAnimationFrame(() => {
        createChart();
      });
    }
  }, [chartData, createChart]);

  const handleTimeframeChange = (timeframe: string) => {
    setCurrentTimeframe(timeframe);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">TOTAL ACCOUNT VALUE</h2>
          <div className="flex gap-1">
            <button
              className={`px-3 py-1 rounded-md font-semibold text-sm transition-all ${showDollar ? 'bg-[#c9b382] text-black' : 'bg-gray-800 text-gray-400'}`}
              onClick={() => setShowDollar(true)}
            >
              $
            </button>
            <button
              className={`px-3 py-1 rounded-md font-semibold text-sm transition-all ${!showDollar ? 'bg-[#c9b382] text-black' : 'bg-gray-800 text-gray-400'}`}
              onClick={() => setShowDollar(false)}
            >
              %
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {['ALL', '72H', '24H', '1H'].map((tf) => (
            <button
              key={tf}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${currentTimeframe === tf ? 'bg-[#c9b382] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-[550px] bg-linear-to-br from-white/5 to-white/10 rounded-lg p-3">
        <svg id="aiModelChart" ref={svgRef} width="100%" height="100%"></svg>
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9b382]"></div>
              <div className="text-[#c9b382] text-base font-semibold">Fetching {currentTimeframe} data...</div>
            </div>
          </div>
        )}
      </div>
      {/* Yield events legend */}
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Yield Generated</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Fees/Costs</span>
        </div>
        <span className="text-gray-500">• Hover markers to see yield details</span>
      </div>
    </div>
  );
};

export default ChartWithData;
