import { NextResponse } from 'next/server';
import { mockAgents } from '@/lib/data/mockAgents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const { searchParams } = new URL(request.url);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const interval = searchParams.get('interval') || '1h';

  // Find agent
  const agent = mockAgents.find(a => a.contractAddress.toLowerCase() === address.toLowerCase());

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Generate mock performance data
  const baseValue = 2000;
  const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
  const targetValue = baseValue * (1 + roiNum / 100);

  const now = Date.now();
  const dataPoints = interval === '1h' ? 12 : interval === '24h' ? 24 : 168;
  const timeInterval = interval === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000;

  const snapshots = [];
  let currentValue = baseValue;

  for (let i = 0; i <= dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeInterval;
    const progress = i / dataPoints;

    const volatility = 0.015;
    const expectedValue = baseValue + (targetValue - baseValue) * progress;
    const noise = (Math.random() - 0.5) * baseValue * volatility;
    currentValue = Math.max(expectedValue + noise, baseValue * 0.8);

    snapshots.push({
      timestamp,
      usdcAmount: currentValue,
      totalValueUsd: currentValue,
    });
  }

  return NextResponse.json({
    agent,
    snapshots,
    currentValue: snapshots[snapshots.length - 1].totalValueUsd,
    initialValue: baseValue,
    totalReturn: snapshots[snapshots.length - 1].totalValueUsd - baseValue,
    roiPercentage: roiNum,
  });
}
