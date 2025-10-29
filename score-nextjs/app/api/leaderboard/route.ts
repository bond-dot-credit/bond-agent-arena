import { NextResponse } from 'next/server';
import { mockAgents } from '@/lib/data/mockAgents';

export async function GET() {
  // Sort agents by ROI (descending)
  const sortedAgents = [...mockAgents].sort((a, b) => {
    const roiA = parseFloat(a.roi.replace('%', '').replace('+', ''));
    const roiB = parseFloat(b.roi.replace('%', '').replace('+', ''));
    return roiB - roiA;
  });

  // Add calculated total values
  const leaderboard = sortedAgents.map((agent, index) => {
    const baseValue = 2000;
    const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
    const totalValueUsd = baseValue * (1 + roiNum / 100);

    return {
      ...agent,
      rank: index + 1,
      totalValueUsd,
      totalReturn: totalValueUsd - baseValue,
    };
  });

  return NextResponse.json(leaderboard);
}
