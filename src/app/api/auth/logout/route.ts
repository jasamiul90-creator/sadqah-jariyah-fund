import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
  
  // Clear custom cookie
  response.cookies.delete('sadqah_session');

  // Clear Supabase session if any
  try {
    const supabase = createServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  return response;
}
