import { NextRequest, NextResponse } from 'next/server';
import { updateContribution, deleteContribution } from '@/lib/dbService';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const id = params.id;
    const body = await req.json();

    const updated = await updateContribution(id, {
      ...(body.contribution_month && { contribution_month: Number(body.contribution_month) }),
      ...(body.contribution_year && { contribution_year: Number(body.contribution_year) }),
      ...(body.expected_amount !== undefined && { expected_amount: Number(body.expected_amount) }),
      ...(body.paid_amount !== undefined && { paid_amount: Number(body.paid_amount) }),
      ...(body.payment_date && { payment_date: body.payment_date }),
      ...(body.payment_method && { payment_method: body.payment_method }),
      ...(body.transaction_reference !== undefined && { transaction_reference: body.transaction_reference }),
      ...(body.notes !== undefined && { notes: body.notes }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'চাঁদার বিবরণ পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contribution: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const id = params.id;

    const success = await deleteContribution(id);
    if (!success) {
      return NextResponse.json({ error: 'রেকর্ড মুছতে ব্যর্থ হয়েছে' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
