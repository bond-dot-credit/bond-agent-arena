import { NextRequest, NextResponse } from 'next/server';
import { AGENT_FULLS } from '@/lib/watchtower-data';

export const runtime = 'edge';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = AGENT_FULLS.find(a => a.id === Number(id));
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(agent);
}
