import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/services/agentService';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();

    // Add calculated total values
    const enrichedLeaderboard = leaderboard.map((agent) => {
      const baseValue = 2000;
      const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
      const totalValueUsd = baseValue * (1 + roiNum / 100);

      return {
        ...agent,
        totalValueUsd,
        totalReturn: totalValueUsd - baseValue,
      };
    });

    return NextResponse.json(enrichedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
