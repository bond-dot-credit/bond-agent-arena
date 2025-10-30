import { NextResponse } from 'next/server';
import { getAgentByAddress, getAgentPerformance } from '@/lib/services/agentService';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const interval = searchParams.get('interval') || '1h';

    // Get agent
    const agent = await getAgentByAddress(address);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Calculate limit and time range based on interval
    let limit: number | undefined;
    let fromTime: number | undefined;
    const now = Date.now();

    if (interval === '1H') {
      limit = 3; // Get last 3 snapshots (1.5 hours of data at 30min intervals)
      fromTime = undefined; // Don't filter by time, just get latest
    } else if (interval === '24H') {
      limit = 24;
      fromTime = now - (24 * 60 * 60 * 1000); // Last 24 hours
    } else if (interval === '72H') {
      limit = 72;
      fromTime = now - (72 * 60 * 60 * 1000); // Last 72 hours
    } else {
      limit = 168; // ALL - 7 days
      fromTime = now - (168 * 60 * 60 * 1000);
    }

    // Get performance data with time filtering
    const snapshots = await getAgentPerformance(
      address,
      from ? parseInt(from) : fromTime,
      to ? parseInt(to) : undefined,
      limit
    );

    const baseValue = 2000;
    const initialValue = snapshots.length > 0 ? snapshots[0].totalValueUsd : baseValue;
    const currentValue = snapshots.length > 0 ? snapshots[snapshots.length - 1].totalValueUsd : baseValue;
    const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));

    return NextResponse.json({
      agent,
      snapshots,
      currentValue,
      initialValue,
      totalReturn: currentValue - initialValue,
      roiPercentage: roiNum,
    });
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
