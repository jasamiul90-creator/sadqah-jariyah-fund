import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt, 
  FileSpreadsheet, 
  ShieldAlert,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { getCurrentUser, ADMIN_NAME, ADMIN_EMAIL } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Strict Server-Side Authentication & Authorization Check
  if (!user) {
    redirect('/login');
  }

  const isSuperAdmin = user.role === 'admin' && (
    user.full_name.trim().toLowerCase() === ADMIN_NAME.toLowerCase() ||
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  if (!isSuperAdmin) {
    // Immediate 403 Forbidden Access Denied for any other user (including committee members)
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-rose-950">অনুমতি নেই (Access Denied)</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            শুধুমাত্র প্রধান অ্যাডমিন (<strong>Md Samiul Islam</strong>)-এর জন্য এই অ্যাডমিন ড্যাশবোর্ডটি সংরক্ষিত। 
            কমিটি বা সাধারণ সদস্যদের এখানে প্রবেশের অধিকার নেই।
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-sm hover:bg-emerald-900"
            >
              <span>আমার সদস্য ড্যাশবোর্ডে যান</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'ওভারভিউ ড্যাশবোর্ড', icon: LayoutDashboard },
    { href: '/admin/members', label: 'সদস্য ব্যবস্থাপনা', icon: Users },
    { href: '/admin/contributions', label: 'মাসিক চাঁদা এন্ট্রি ও খতিয়ান', icon: CreditCard },
    { href: '/admin/expenses', label: 'তহবিল ব্যয় ব্যবস্থাপনা', icon: Receipt },
    { href: '/admin/reports', label: 'আর্থিক রিপোর্ট ও স্টেটমেন্ট', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-emerald-100 flex flex-col p-4 sm:p-6 shrink-0 shadow-sm">
        <div className="pb-6 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-emerald-950 block">
                অ্যাডমিন কনসোল
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                Md Samiul Islam (Admin)
              </span>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-gray-100">
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              একক অ্যাডমিন নিরাপত্তা
            </span>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              সদকায়ে জারিয়া ফান্ডের সকল আর্থিক অধিকার ও ডাটাবেজ পরিবর্তন সুরক্ষিত।
            </p>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
