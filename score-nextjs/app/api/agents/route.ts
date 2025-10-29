import { NextResponse } from 'next/server';
import { mockAgents } from '@/lib/data/mockAgents';

export async function GET() {
  return NextResponse.json(mockAgents);
}
