import { NextRequest, NextResponse } from 'next/server';
import { getMembers, addMember } from '@/lib/dbService';
import { verifyAdmin, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'লগইন আবশ্যক' }, { status: 401 });
    }

    const members = await getMembers();

    // If user is not admin, committee or member only gets safe directory info (name, role, status)
    if (user.role !== 'admin') {
      const sanitized = members.map((m) => ({
        id: m.id,
        full_name: m.full_name,
        role: m.role,
        member_status: m.member_status,
      }));
      return NextResponse.json({ members: sanitized });
    }

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(); // Only Md Samiul Islam can add members
    const body = await req.json();

    if (!body.full_name || !body.email) {
      return NextResponse.json({ error: 'নাম এবং ইমেইল আবশ্যক' }, { status: 400 });
    }

    const created = await addMember({
      full_name: body.full_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      role: body.role === 'committee' ? 'committee' : 'member', // Never allow creating admin accounts
      monthly_contribution: Number(body.monthly_contribution) || 0,
      member_status: body.member_status || 'active',
    });

    return NextResponse.json({ success: true, member: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}
