import { cookies } from 'next/headers';
import { createClient as createServerClient } from './supabase/server';
import { getMemberById, getMembers } from './dbService';
import { Profile } from '@/types/database';

export const ADMIN_NAME = 'Md Samiul Islam';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sadqahfund.org';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'committee' | 'member';
  } | null;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('sadqah_session')?.value;

  // 1. Check if mock/demo session cookie is set
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed?.id || parsed?.email) {
        const member = await getMemberById(parsed.id || parsed.email);
        if (member) return member;
      }
    } catch {
      // Invalid cookie format
    }
  }

  // 2. Check Supabase Auth
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const members = await getMembers();
      const member = members.find((m) => m.email.toLowerCase() === user.email?.toLowerCase() || m.auth_user_id === user.id);
      if (member) return member;
    }
  } catch {
    // Supabase auth failed or not configured
  }

  return null;
}

export async function verifyAdmin(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED: অনুগ্রহ করে লগইন করুন (Please log in)');
  }

  // STRICT REQUIREMENT: Only Md Samiul Islam has admin access
  const isSuperAdmin = user.role === 'admin' && (user.full_name.trim().toLowerCase() === ADMIN_NAME.toLowerCase() || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!isSuperAdmin) {
    throw new Error('FORBIDDEN: আপনার অ্যাডমিন ড্যাশবোর্ডে প্রবেশের অনুমতি নেই। (Access denied)');
  }

  return user;
}
