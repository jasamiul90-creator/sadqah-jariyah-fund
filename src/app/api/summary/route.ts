import { NextResponse } from 'next/server';
import { getFundSummary } from '@/lib/dbService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getFundSummary();
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
