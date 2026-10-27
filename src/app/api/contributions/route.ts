import { NextRequest, NextResponse } from 'next/server';
import { getContributions, addContribution } from '@/lib/dbService';
import { verifyAdmin, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'লগইন আবশ্যক' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberIdParam = searchParams.get('memberId');
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    const statusParam = searchParams.get('status');

    // SECURITY: If not admin, the user can ONLY view their own records!
    let targetMemberId = memberIdParam;
    if (user.role !== 'admin') {
      targetMemberId = user.id;
    }

    const contributions = await getContributions({
      memberId: targetMemberId || undefined,
      year: yearParam ? parseInt(yearParam) : undefined,
      month: monthParam ? parseInt(monthParam) : undefined,
      status: statusParam || undefined,
    });

    return NextResponse.json({ contributions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(); // Only Admin can insert contributions
    const body = await req.json();

    if (!body.member_id || !body.contribution_month || !body.contribution_year) {
      return NextResponse.json({ error: 'সদস্য, মাস এবং বছর আবশ্যক' }, { status: 400 });
    }

    const created = await addContribution({
      member_id: body.member_id,
      contribution_month: Number(body.contribution_month),
      contribution_year: Number(body.contribution_year),
      expected_amount: Number(body.expected_amount) || 0,
      paid_amount: Number(body.paid_amount) || 0,
      payment_date: body.payment_date || new Date().toISOString().split('T')[0],
      payment_method: body.payment_method || 'bKash',
      transaction_reference: body.transaction_reference || null,
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, contribution: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
