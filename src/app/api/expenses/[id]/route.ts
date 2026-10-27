import { NextRequest, NextResponse } from 'next/server';
import { updateExpense, deleteExpense } from '@/lib/dbService';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const id = params.id;
    const body = await req.json();

    const updated = await updateExpense(id, {
      ...(body.expense_title && { expense_title: body.expense_title.trim() }),
      ...(body.category && { category: body.category }),
      ...(body.amount !== undefined && { amount: Number(body.amount) }),
      ...(body.expense_date && { expense_date: body.expense_date }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.receipt_url !== undefined && { receipt_url: body.receipt_url?.trim() || null }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'ব্যয়ের রেকর্ড পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, expense: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const id = params.id;

    const success = await deleteExpense(id);
    if (!success) {
      return NextResponse.json({ error: 'ব্যয়ের রেকর্ড মুছতে ব্যর্থ হয়েছে' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'ব্যয় রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
