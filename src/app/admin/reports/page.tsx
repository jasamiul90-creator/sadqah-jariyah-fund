'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  FileText, 
  Filter, 
  Calendar,
  Wallet,
  TrendingUp,
  HeartHandshake,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Contribution, Expense, Profile, FundSummary } from '@/types/database';
import { BANGLA_MONTHS, formatBDT, toBengaliNumber, getBanglaMonthName, STATUS_LABELS, formatDate } from '@/lib/bangla';
import { exportFinancialStatementCSV, exportFinancialStatementPDF } from '@/lib/export';

export default function ReportsAdminPage() {
  const currentYear = new Date().getFullYear();
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMember, setFilterMember] = useState('');
  const [filterYear, setFilterYear] = useState<number | ''>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

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

  // Filtered lists
  const filteredContributions = contributions.filter((c) => {
    if (filterMember && c.member_id !== filterMember) return false;
    if (filterYear && c.contribution_year !== Number(filterYear)) return false;
    if (filterMonth && c.contribution_month !== Number(filterMonth)) return false;
    if (filterStatus) {
      const exp = Number(c.expected_amount) || 0;
      const paid = Number(c.paid_amount) || 0;
      let status: 'paid' | 'partial' | 'due' = 'paid';
      if (paid === 0) status = 'due';
      else if (paid < exp) status = 'partial';
      if (status !== filterStatus) return false;
    }
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (filterYear) {
      const d = new Date(e.expense_date);
      if (d.getFullYear() !== Number(filterYear)) return false;
    }
    if (filterMonth) {
      const d = new Date(e.expense_date);
      if (d.getMonth() + 1 !== Number(filterMonth)) return false;
    }
    return true;
  });

  // Calculate dynamic filtered totals
  const totalExpected = filteredContributions.reduce((sum, c) => sum + Number(c.expected_amount || 0), 0);
  const totalCollection = filteredContributions.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);
  const totalDue = filteredContributions.reduce((sum, c) => {
    const due = Number(c.expected_amount || 0) - Number(c.paid_amount || 0);
    return sum + (due > 0 ? due : 0);
  }, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const currentBalance = totalCollection - totalExpenses;

  const dynamicSummary: FundSummary = {
    total_members: members.length,
    active_members: members.filter((m) => m.member_status === 'active').length,
    total_monthly_expected: totalExpected,
    total_collection: totalCollection,
    total_expenses: totalExpenses,
    current_balance: currentBalance,
    total_due: totalDue,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-700" />
            <span>আর্থিক রিপোর্ট ও হিসাব বিবরণী</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            মাসিক ও বাৎসরিক হিসাব বিশ্লেষণ, স্টেটমেন্ট প্রিন্ট এবং PDF/CSV এক্সপোর্ট
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportFinancialStatementPDF(dynamicSummary, filteredContributions, filteredExpenses)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition-transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>PDF ডাউনলোড</span>
          </button>

          <button
            onClick={() => exportFinancialStatementCSV(dynamicSummary, filteredContributions, filteredExpenses)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-semibold text-xs shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-semibold text-xs shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>প্রিন্ট করুন</span>
          </button>

          <button
            onClick={fetchData}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-800 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs print:hidden">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">সদস্য দিয়ে ফিল্টার</label>
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          >
            <option value="">সকল সদস্য (All Members)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">বছর</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          >
            <option value="">সকল বছর</option>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {toBengaliNumber(y)} ({y})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">মাস</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          >
            <option value="">সকল মাস (All Months)</option>
            {BANGLA_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} ({m.en})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">পেমেন্ট স্ট্যাটাস</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          >
            <option value="">সকল স্ট্যাটাস</option>
            <option value="paid">পরিশোধিত (Paid)</option>
            <option value="partial">আংশিক পরিশোধ (Partial)</option>
            <option value="due">বকেয়া (Due)</option>
          </select>
        </div>
      </div>

      {/* Printable Statement Document Container */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Letterhead */}
        <div className="text-center border-b border-emerald-800 pb-6 space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
            সদকায়ে জারিয়া মাসিক ফান্ড
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 font-semibold">
            প্রতিটি অবদান হোক কল্যাণের পথে | Sadqah Jariyah Monthly Fund
          </p>
          <p className="text-xs text-gray-500">
            আর্থিক প্রতিবেদন ও হিসাব বিবরণী | তারিখ: {new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
            <span className="text-[11px] font-semibold text-emerald-900 block mb-1">ধার্যকৃত চাঁদা</span>
            <span className="text-base sm:text-lg font-black text-emerald-950">
              {formatBDT(totalExpected)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-center">
            <span className="text-[11px] font-semibold text-emerald-900 block mb-1">প্রকৃত আদায় (Collection)</span>
            <span className="text-base sm:text-lg font-black text-emerald-900">
              {formatBDT(totalCollection)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[11px] font-semibold text-rose-900 block mb-1">মোট বকেয়া (Due)</span>
            <span className="text-base sm:text-lg font-black text-rose-700">
              {formatBDT(totalDue)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-100/70 border border-rose-300 text-center">
            <span className="text-[11px] font-semibold text-rose-950 block mb-1">মোট ব্যয় (Expenses)</span>
            <span className="text-base sm:text-lg font-black text-rose-900">
              {formatBDT(totalExpenses)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-amber-900 block mb-1">বর্তমান স্থিতি (Balance)</span>
            <span className="text-base sm:text-lg font-black text-amber-900">
              {formatBDT(currentBalance)}
            </span>
          </div>
        </div>

        {/* Member Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-emerald-950 flex items-center justify-between">
            <span>১. সদস্যভিত্তিক চাঁদা আদায়ের তালিকা</span>
            <span className="text-xs text-gray-500 font-normal">রেকর্ড: {toBengaliNumber(filteredContributions.length)} টি</span>
          </h3>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-800 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">সদস্যের নাম</th>
                  <th className="py-2.5 px-3 font-semibold">মাস ও বছর</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ধার্য (৳)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">আদায় (৳)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">বকেয়া (৳)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 font-semibold">মাধ্যম ও তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      কোনো রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((c) => {
                    const exp = Number(c.expected_amount) || 0;
                    const paid = Number(c.paid_amount) || 0;
                    const due = Math.max(0, exp - paid);

                    let statusKey: 'paid' | 'partial' | 'due' = 'paid';
                    if (paid === 0) statusKey = 'due';
                    else if (paid < exp) statusKey = 'partial';

                    return (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-medium text-gray-900">{c.member?.full_name}</td>
                        <td className="py-2 px-3">{getBanglaMonthName(c.contribution_month)} {toBengaliNumber(c.contribution_year)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatBDT(exp)}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-800">{formatBDT(paid)}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">{due > 0 ? formatBDT(due) : '—'}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_LABELS[statusKey].color}`}>
                            {STATUS_LABELS[statusKey].bn}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500">{c.payment_method} ({formatDate(c.payment_date)})</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-emerald-950 flex items-center justify-between">
            <span>২. তহবিল ব্যয়ের তালিকা</span>
            <span className="text-xs text-gray-500 font-normal">রেকর্ড: {toBengaliNumber(filteredExpenses.length)} টি</span>
          </h3>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-800 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">তারিখ</th>
                  <th className="py-2.5 px-3 font-semibold">ব্যয়ের খাত</th>
                  <th className="py-2.5 px-3 font-semibold">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3 font-semibold text-right">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      কোনো ব্যয়ের রেকর্ড নেই
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 px-3">{formatDate(e.expense_date)}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{e.expense_title}</td>
                      <td className="py-2 px-3 text-gray-600">{e.category}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700">{formatBDT(e.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-12 flex items-center justify-between text-xs text-gray-600">
          <div>
            <div className="w-44 border-b border-gray-400 mb-1" />
            <p className="font-bold text-emerald-950">Md Samiul Islam</p>
            <p>প্রধান পরিচালক ও হিসাবরক্ষক</p>
            <p>সদকায়ে জারিয়া মাসিক ফান্ড</p>
          </div>

          <div className="text-right">
            <div className="w-44 border-b border-gray-400 mb-1 ml-auto" />
            <p className="font-bold text-emerald-950">কার্যকরী কমিটি প্রতিনিধি</p>
            <p>নিরীক্ষা ও প্রত্যয়নকারী</p>
          </div>
        </div>
      </div>
    </div>
  );
}
