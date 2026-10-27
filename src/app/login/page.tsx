'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Lock, Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে');
      }

      router.push(data.redirect || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setQuickCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-900 mx-auto flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-950/20">
            <HeartHandshake className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            সদস্য লগইন
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            সদকায়ে জারিয়া মাসিক ফান্ড অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-xl shadow-emerald-900/5 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                ইমেইল ঠিকানা (Email)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sadqahfund.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm text-gray-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block text-center">
              এক ক্লিকে ডেমো টেস্ট করুন:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setQuickCredentials('admin@sadqahfund.org', '123456')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold text-left hover:bg-emerald-100 transition-colors flex items-center justify-between"
              >
                <span>অ্যাডমিন (Md Samiul)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={() => setQuickCredentials('abu.sayed@sadqahfund.org', '123456')}
                className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold text-left hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>সাধারণ সদস্য (Abu Sayed)</span>
                <CheckCircle className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              সকল টেস্ট অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড: <span className="font-mono text-emerald-800 font-bold">123456</span>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-emerald-800 font-semibold hover:underline">
            ← প্রধান ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
