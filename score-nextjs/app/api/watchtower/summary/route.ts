import { NextResponse } from 'next/server';
import { getSummary } from '@/lib/db/watchtower-db';

export const revalidate = 3600;

export async function GET() {
  const summary = await getSummary();
  return NextResponse.json(summary);
}
