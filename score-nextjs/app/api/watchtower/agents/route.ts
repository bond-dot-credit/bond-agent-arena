import { NextResponse } from 'next/server';
import { AGENT_SUMMARIES } from '@/lib/watchtower-data';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(AGENT_SUMMARIES);
}
