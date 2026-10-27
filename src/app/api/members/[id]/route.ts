import { NextRequest, NextResponse } from 'next/server';
import { updateMember, getMemberById } from '@/lib/dbService';
import { verifyAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const id = params.id;
    const body = await req.json();

    const existing = await getMemberById(id);
    if (!existing) {
      return NextResponse.json({ error: 'সদস্য পাওয়া যায়নি' }, { status: 404 });
    }

    // Protect against demoting or tampering admin role if this is Samiul Islam
    let role = body.role;
    if (existing.role === 'admin') {
      role = 'admin'; // Cannot strip admin from Samiul Islam
    } else if (role === 'admin') {
      return NextResponse.json({ error: 'নতুন অ্যাডমিন তৈরি করা অনুমোদিত নয়।' }, { status: 403 });
    }

    const updated = await updateMember(id, {
      ...(body.full_name && { full_name: body.full_name.trim() }),
      ...(body.phone !== undefined && { phone: body.phone?.trim() || null }),
      ...(role && { role }),
      ...(body.monthly_contribution !== undefined && { monthly_contribution: Number(body.monthly_contribution) }),
      ...(body.member_status && { member_status: body.member_status }),
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('FORBIDDEN') ? 403 : 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Password reset action for member
  try {
    await verifyAdmin();
    const id = params.id;
    const { action, password } = await req.json();

    if (action === 'reset_password') {
      const member = await getMemberById(id);
      if (!member) {
        return NextResponse.json({ error: 'সদস্য পাওয়া যায়নি' }, { status: 404 });
      }

      const adminSupabase = createAdminClient();
      if (adminSupabase && member.auth_user_id) {
        await adminSupabase.auth.admin.updateUserById(member.auth_user_id, {
          password: password || '123456',
        });
      }

      return NextResponse.json({
        success: true,
        message: `${member.full_name}-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে। নতুন পাসওয়ার্ড: ${password || '123456'}`
      });
    }

    return NextResponse.json({ error: 'অজ্ঞাত অ্যাকশন' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
