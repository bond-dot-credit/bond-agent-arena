import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, updateAgent } from '@/lib/db/watchtower-db';
import type { AgentUpdatePayload } from '@/lib/db/watchtower-db';

export const revalidate = 3600;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(Number(id));
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = process.env.WATCHTOWER_API_KEY;
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: AgentUpdatePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ALLOWED_FIELDS: (keyof AgentUpdatePayload)[] = [
    'performance_score', 'risk_score', 'stability_score', 'sentiment_score', 'provenance_score',
    'sharpe_ratio', 'max_drawdown', 'leverage', 'liquidation_proximity', 'liquidity_exposure',
    'protocol_diversity', 'credit_capacity', 'score_trend', 'days_since_scored', 'strategy_notes',
    'capital_apy_total', 'capital_apy_native', 'reward_dependency', 'total_yield', 'native_yield',
    'reward_yield', 'total_volume', 'transaction_count', 'cadence_days', 'capital_deployed',
    'capital_turnover', 'tyr', 'yield_per_1k', 'signal',
  ];

  const payload: AgentUpdatePayload = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) (payload as Record<string, unknown>)[field] = body[field];
  }

  try {
    const updated = await updateAgent(Number(id), payload);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
