import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/dbService';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();
    const logs = await getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
