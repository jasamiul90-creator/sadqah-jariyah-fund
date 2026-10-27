import React from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  Users, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  CreditCard,
  PieChart
} from 'lucide-react';
import { getFundSummary } from '@/lib/dbService';
import { formatBDT, toBengaliNumber } from '@/lib/bangla';
import StatCard from '@/components/ui/StatCard';

export const revalidate = 0; // Fresh data

export default async function HomePage() {
  const summary = await getFundSummary();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 islamic-pattern pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top duration-500">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>২৫ জন নিবেদিতপ্রাণ সদস্যের কল্যাণমূলক ঐক্য</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            সদকায়ে জারিয়া মাসিক ফান্ড
          </h1>

          <p className="text-lg sm:text-2xl text-emerald-100 font-medium max-w-2xl mx-auto">
            প্রতিটি অবদান হোক কল্যাণের পথে
          </p>

          <p className="text-sm sm:text-base text-emerald-200/90 max-w-3xl mx-auto leading-relaxed">
            একটি সুশৃঙ্খল, স্বচ্ছ এবং আধুনিক প্ল্যাটফর্ম যা প্রতিটি সদস্যের মাসিক অনুদান সংরক্ষণ, 
            যথাযথ মানবিক কল্যাণমূলক খাতে বিতরণ এবং পূর্ণ জবাবদিহিতা নিশ্চিত করে।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-base shadow-lg shadow-amber-900/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/summary"
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-2"
            >
              <PieChart className="w-5 h-5 text-emerald-300" />
              <span>তহবিলের সারসংক্ষেপ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Financial Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="মোট নিবন্ধিত সদস্য"
            value={`${toBengaliNumber(summary.total_members)} জন`}
            subtitle="১ অ্যাডমিন + ৪ কমিটি + ২০ সাধারণ"
            icon={Users}
            variant="blue"
            badge="সক্রিয়"
          />

          <StatCard
            title="সর্বমোট সংগৃহীত চাঁদা"
            value={formatBDT(summary.total_collection)}
            subtitle="সদস্যদের প্রদত্ত মোট অনুদান"
            icon={Wallet}
            variant="emerald"
            badge="আদায়"
          />

          <StatCard
            title="সর্বমোট জনকল্যাণমূলক ব্যয়"
            value={formatBDT(summary.total_expenses)}
            subtitle="চিকিৎসা, মাদ্রাসা ও মানবিক সহায়তা"
            icon={TrendingUp}
            variant="rose"
            badge="ব্যয়িত"
          />

          <StatCard
            title="বর্তমান নগদ তহবিল স্থিতি"
            value={formatBDT(summary.current_balance)}
            subtitle="মোট আদায় - মোট ব্যয়"
            icon={HeartHandshake}
            variant="amber"
            badge="মজুদ তহবিল"
          />
        </div>
      </section>

      {/* Islamic Fund Objectives & Trust Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>আমাদের লক্ষ্য ও বৈশিষ্ট্য</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            স্বচ্ছতা, ঐক্য এবং আন্তরিক সামাজিক সেবা
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            সদকায়ে জারিয়া মাসিক ফান্ড পরিচালিত হয় পারস্পরিক বিশ্বস্ততা ও সর্বোচ্চ সততার সাথে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CreditCard className="w-7 h-7 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">ব্যক্তিগত স্বতঃস্ফূর্ত মাসিক চাঁদা</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              প্রতিটি সদস্য নিজের সামর্থ্য অনুযায়ী স্বাধীনভাবে নির্দিষ্ট অঙ্কের মাসিক চাঁদা প্রদান করেন। 
              কোনো বাধ্যবাধকতা ছাড়াই সবাই নিজ নিজ অবস্থানে ভূমিকা রাখছেন।
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">ব্যক্তিগত গোপনীয়তা ও নিরাপত্তা</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              সুপার-সিকিউর Row Level Security (RLS) এর কারণে একজন সদস্য শুধুমাত্র নিজের লেনদেন দেখতে পারেন। 
              অন্য কোনো সদস্যের ব্যক্তিগত তথ্য অপর কারও কাছে দৃশ্যমান নয়।
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <PieChart className="w-7 h-7 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">উন্মুক্ত সামগ্রিক হিসাব ও রিপোর্ট</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ফান্ডের মোট কত টাকা উঠেছে, কত টাকা কোথায় খরচ হয়েছে এবং তহবিলে বর্তমানে কত অবশিষ্ট রয়েছে—তার সার্বিক 
              হিসাব সকল সদস্যের জন্য সর্বদা উন্মুক্ত ও স্পষ্ট।
            </p>
          </div>
        </div>
      </section>

      {/* Committee & Transparency Statement */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-emerald-900 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold">আপনি কি সদকায়ে জারিয়া ফান্ডের সদস্য?</h3>
              <p className="text-emerald-200 text-sm sm:text-base max-w-xl">
                আপনার নির্ধারিত অ্যাকাউন্টে লগইন করে আপনার মাসিক জমার হিসাব, বকেয়া এবং অর্থ প্রদানের ইতিহাস যাচাই করুন।
              </p>
            </div>
            <Link
              href="/login"
              className="whitespace-nowrap px-8 py-3.5 rounded-2xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-colors shadow-md"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
