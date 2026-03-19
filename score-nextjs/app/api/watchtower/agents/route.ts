import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/db/watchtower-db';

export const revalidate = 3600;

export async function GET() {
  const agents = await getAgents();
  return NextResponse.json(agents);
}
