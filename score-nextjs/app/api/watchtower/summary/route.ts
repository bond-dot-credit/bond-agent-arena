import { NextResponse } from 'next/server';
import { getWatchtowerSummary } from '@/lib/watchtower-data';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(getWatchtowerSummary());
}
