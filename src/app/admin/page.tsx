'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  HeartHandshake, 
  AlertCircle, 
  CreditCard,
  PlusCircle, 
  DollarSign, 
  Receipt, 
  FileSpreadsheet, 
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { MonthlyComparisonChart, FundBalanceTrendChart } from '@/components/ui/Charts';
import { formatBDT, toBengaliNumber, getBanglaMonthName, ROLE_LABELS, STATUS_LABELS } from '@/lib/bangla';
import { Profile, Contribution, Expense, FundSummary } from '@/types/database';
import AddMemberModal from '@/components/forms/AddMemberModal';
import EnterContributionModal from '@/components/forms/EnterContributionModal';
import RecordExpenseModal from '@/components/forms/RecordExpenseModal';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [enterContribOpen, setEnterContribOpen] = useState(false);
  const [recordExpenseOpen, setRecordExpenseOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, memRes, contRes, expRes] = await Promise.all([
        fetch('/api/summary').then((r) => r.json()),
        fetch('/api/members').then((r) => r.json()),
        fetch('/api/contributions').then((r) => r.json()),
        fetch('/api/expenses').then((r) => r.json()),
      ]);

      if (sumRes.summary) setSummary(sumRes.summary);
      if (memRes.members) setMembers(memRes.members);
      if (contRes.contributions) setContributions(contRes.contributions);
      if (expRes.expenses) setExpenses(expRes.expenses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute monthly data for charts (last 6 months)
  const currentYear = new Date().getFullYear();
  const chartMonthlyData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
    const monthConts = contributions.filter((c) => c.contribution_month === m && c.contribution_year === currentYear);
    const col = monthConts.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);

    const monthExps = expenses.filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() + 1 === m && d.getFullYear() === currentYear;
    });
    const exp = monthExps.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      month: getBanglaMonthName(m),
      collection: col,
      expenses: exp,
      balance: Math.max(0, col - exp),
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950">
            অ্যাডমিন ওভারভিউ ড্যাশবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            তহবিলের যাবতীয় আর্থিক হিসাব, চাঁদা আদায়, ব্যয় এবং সদস্য পর্যবেক্ষণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setEnterContribOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition-transform hover:scale-105"
          >
            <DollarSign className="w-4 h-4" />
            <span>চাঁদা জমা নিন</span>
          </button>

          <button
            onClick={() => setRecordExpenseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-transform hover:scale-105"
          >
            <Receipt className="w-4 h-4" />
            <span>ব্যয় এন্ট্রি</span>
          </button>

          <button
            onClick={() => setAddMemberOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-semibold text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>নতুন সদস্য</span>
          </button>

          <button
            onClick={fetchData}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-800 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="মোট সদস্য"
          value={`${toBengaliNumber(summary?.total_members || 25)} জন`}
          subtitle="২৫ জন সদস্য তালিকাভুক্ত"
          icon={Users}
          variant="blue"
        />

        <StatCard
          title="মাসিক মোট ধার্য"
          value={formatBDT(summary?.total_monthly_expected || 0)}
          subtitle="সকল সদস্যের নির্ধারিত যোগফল"
          icon={CreditCard}
          variant="purple"
        />

        <StatCard
          title="সর্বমোট আদায়"
          value={formatBDT(summary?.total_collection || 0)}
          subtitle="প্রদত্ত মোট চাঁদার পরিমাণ"
          icon={Wallet}
          variant="emerald"
        />

        <StatCard
          title="সর্বমোট ব্যয়"
          value={formatBDT(summary?.total_expenses || 0)}
          subtitle="সকল খাতের মোট খরচ"
          icon={TrendingUp}
          variant="rose"
        />

        <StatCard
          title="বর্তমান তহবিল স্থিতি"
          value={formatBDT(summary?.current_balance || 0)}
          subtitle="আদায় − ব্যয়"
          icon={HeartHandshake}
          variant="amber"
          badge="নগদ স্থিতি"
        />

        <StatCard
          title="সর্বমোট বকেয়া"
          value={formatBDT(summary?.total_due || 0)}
          subtitle="অপরাহত অবশিষ্ট পাওনা"
          icon={AlertCircle}
          variant="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection vs Expense Chart */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-950">মাসিক আদায় বনাম ব্যয় (চলতি বছর)</h3>
              <p className="text-xs text-gray-500">প্রতি মাসের মোট সংগৃহীত অনুদান ও ব্যয়ের তুলনা</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {toBengaliNumber(currentYear)}
            </span>
          </div>
          <MonthlyComparisonChart data={chartMonthlyData} />
        </div>

        {/* Fund Balance Curve */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-950">তহবিল স্থিতির গতিধারা (Fund Balance Trend)</h3>
              <p className="text-xs text-gray-500">চলতি বছরের প্রতি মাসে অবশিষ্ট তহবিলের চিত্র</p>
            </div>
          </div>
          <FundBalanceTrendChart data={chartMonthlyData} />
        </div>
      </div>

      {/* Member Financial Overview Table (Preview of all 25 members) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-emerald-950">
              সদস্যদের চাঁদা ও বকেয়া খতিয়ান
            </h2>
            <p className="text-xs text-gray-500">
              সদস্যদের নাম, ব্যক্তিগত নির্ধারিত চাঁদা, মোট পরিশোধিত এবং বকেয়ার পূর্ণাঙ্গ তালিকা
            </p>
          </div>

          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            <span>সম্পূর্ণ তালিকা ও ব্যবস্থাপনা</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">সদস্যের নাম</th>
                <th className="py-3.5 px-4 font-semibold">পদবী / ভূমিকা</th>
                <th className="py-3.5 px-4 font-semibold text-right">নির্ধারিত মাসিক চাঁদা</th>
                <th className="py-3.5 px-4 font-semibold text-right">মোট পরিশোধিত</th>
                <th className="py-3.5 px-4 font-semibold text-right">মোট বকেয়া</th>
                <th className="py-3.5 px-4 font-semibold text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : (
                members.slice(0, 10).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-emerald-950">
                      <div>{m.full_name}</div>
                      <div className="text-[11px] text-gray-400 font-normal">{m.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {ROLE_LABELS[m.role]?.bn || m.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-800">
                      {formatBDT(m.monthly_contribution)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatBDT(m.total_paid || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {(m.total_due || 0) > 0 ? formatBDT(m.total_due) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          STATUS_LABELS[m.member_status]?.color || ''
                        }`}
                      >
                        {STATUS_LABELS[m.member_status]?.bn || m.member_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/members`}
                        className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
                      >
                        বিস্তারিত
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={fetchData}
      />

      <EnterContributionModal
        isOpen={enterContribOpen}
        onClose={() => setEnterContribOpen(false)}
        members={members}
        onSuccess={fetchData}
      />

      <RecordExpenseModal
        isOpen={recordExpenseOpen}
        onClose={() => setRecordExpenseOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
