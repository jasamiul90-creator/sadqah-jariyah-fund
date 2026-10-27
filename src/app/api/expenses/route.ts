import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, addExpense } from '@/lib/dbService';
import { verifyAdmin, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const expenses = await getExpenses();
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    const body = await req.json();

    if (!body.expense_title || !body.category || !body.amount) {
      return NextResponse.json({ error: 'ব্যয়ের শিরোনাম, ক্যাটাগরি এবং পরিমাণ আবশ্যক' }, { status: 400 });
    }

    const created = await addExpense({
      expense_title: body.expense_title.trim(),
      category: body.category,
      amount: Number(body.amount),
      expense_date: body.expense_date || new Date().toISOString().split('T')[0],
      description: body.description?.trim() || null,
      receipt_url: body.receipt_url?.trim() || null,
      created_by: admin.id,
    });

    return NextResponse.json({ success: true, expense: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
