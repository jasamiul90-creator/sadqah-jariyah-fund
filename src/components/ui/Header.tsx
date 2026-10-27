'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  ShieldCheck, 
  PieChart, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  UserCircle 
} from 'lucide-react';
import { ROLE_LABELS } from '@/lib/bangla';

interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'committee' | 'member';
}

export default function Header() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-200">
              <HeartHandshake className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-emerald-950 tracking-tight">
                  সদকায়ে জারিয়া মাসিক ফান্ড
                </span>
                <span className="hidden md:inline-block text-[11px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Sadqah Fund
                </span>
              </div>
              <p className="text-xs text-emerald-700 hidden sm:block font-medium">
                প্রতিটি অবদান হোক কল্যাণের পথে
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/50'
              }`}
            >
              হোম
            </Link>

            <Link
              href="/summary"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/summary'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/50'
              }`}
            >
              <PieChart className="w-4 h-4 text-emerald-600" />
              তহবিলের বিবরণ
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                আমার ড্যাশবোর্ড
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-900 hover:bg-emerald-100/70 border border-emerald-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                অ্যাডমিন প্যানেল
              </Link>
            )}
          </nav>

          {/* User profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-emerald-100">
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-950 flex items-center justify-end gap-1.5">
                    <UserCircle className="w-4 h-4 text-emerald-700" />
                    <span>{user.full_name}</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    {ROLE_LABELS[user.role]?.bn || user.role}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm shadow-sm transition-all hover:shadow hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন করুন</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-emerald-950 hover:bg-emerald-50 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-emerald-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {user && (
            <div className="p-3 mb-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-emerald-950">{user.full_name}</p>
                <p className="text-xs text-emerald-700 font-medium">
                  {ROLE_LABELS[user.role]?.bn || user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                লগআউট
              </button>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:bg-emerald-50"
          >
            হোম
          </Link>
          <Link
            href="/summary"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:bg-emerald-50"
          >
            তহবিলের বিবরণ
          </Link>
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:bg-emerald-50"
            >
              আমার ড্যাশবোর্ড
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium bg-emerald-800 text-white"
            >
              অ্যাডমিন প্যানেল
            </Link>
          )}
          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 w-full py-3 rounded-xl bg-emerald-800 text-white font-medium"
            >
              <LogIn className="w-5 h-5" />
              লগইন করুন
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
