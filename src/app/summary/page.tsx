import React from 'react';
import { 
  HeartHandshake, 
  Users, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  PieChart as PieIcon,
  Calendar,
  FileText
} from 'lucide-react';
import { getFundSummary, getExpenses } from '@/lib/dbService';
import { formatBDT, toBengaliNumber, getBanglaCategoryName, formatDate } from '@/lib/bangla';
import StatCard from '@/components/ui/StatCard';
import { ExpenseCategoryPieChart } from '@/components/ui/Charts';

export const revalidate = 0;

export default async function SummaryPage() {
  const summary = await getFundSummary();
  const expenses = await getExpenses();

  // Aggregate expenses by category for chart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const categoryChartData = Object.entries(categoryMap).map(([cat, amount]) => ({
    name: getBanglaCategoryName(cat),
    value: amount,
    color: '#059669',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>সার্বজনীন স্বচ্ছতা ও জবাবদিহিতা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-950">
          তহবিলের সামগ্রিক আর্থিক বিবরণী
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          সকল সদস্যের অবগতির জন্য তহবিলের বর্তমান স্থিতি ও জনকল্যাণমূলক ব্যয়ের উন্মুক্ত পরিসংখ্যান।
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="মোট সদস্য সংখ্যা"
          value={`${toBengaliNumber(summary.total_members)} জন`}
          subtitle="সকল সদস্য সক্রিয়"
          icon={Users}
          variant="blue"
        />

        <StatCard
          title="সর্বমোট আদায়কৃত অর্থ"
          value={formatBDT(summary.total_collection)}
          subtitle="ফান্ড প্রতিষ্ঠালগ্ন থেকে আদায়"
          icon={Wallet}
          variant="emerald"
        />

        <StatCard
          title="সর্বমোট ব্যয়িত অর্থ"
          value={formatBDT(summary.total_expenses)}
          subtitle="বিভিন্ন কল্যাণমূলক খাতে প্রদান"
          icon={TrendingUp}
          variant="rose"
        />

        <StatCard
          title="বর্তমান তহবিল স্থিতি (Balance)"
          value={formatBDT(summary.current_balance)}
          subtitle="হিসাব: মোট আদায় - মোট ব্যয়"
          icon={HeartHandshake}
          variant="amber"
          badge="নগদ ব্যালেন্স"
        />
      </div>

      {/* Formula Card */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
            ৳
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">বর্তমান ফান্ড ব্যালেন্সের সমীকরণ:</h4>
            <p className="text-xs text-gray-500">স্বয়ংক্রিয় হিসাব সূত্র</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200">
          <span className="text-emerald-800">মোট আদায় ({formatBDT(summary.total_collection)})</span>
          <span className="text-gray-400 font-bold text-lg">−</span>
          <span className="text-rose-700">মোট ব্যয় ({formatBDT(summary.total_expenses)})</span>
          <span className="text-gray-400 font-bold text-lg">=</span>
          <span className="text-emerald-950 font-bold bg-white px-3 py-1 rounded-lg border border-emerald-300">
            {formatBDT(summary.current_balance)}
          </span>
        </div>
      </div>

      {/* Expenses & Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-emerald-950">খাতভিত্তিক ব্যয়ের বণ্টন</h3>
          </div>
          <p className="text-xs text-gray-500">
            তহবিলের অর্থ কোন কোন কল্যাণমূলক খাতে খরচ করা হয়েছে:
          </p>

          <ExpenseCategoryPieChart data={categoryChartData} />
        </div>

        {/* Recent Public Expenses Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-emerald-950">সাম্প্রতিক ব্যয়ের খতিয়ান</h3>
            </div>
            <span className="text-xs text-gray-500">
              মোট রেকর্ড: {toBengaliNumber(expenses.length)} টি
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">তারিখ</th>
                  <th className="py-3 px-4 font-semibold">ব্যয়ের খাত / বিবরণ</th>
                  <th className="py-3 px-4 font-semibold">ক্যাটাগরি</th>
                  <th className="py-3 px-4 font-semibold text-right">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      এখনও কোনো ব্যয়ের রেকর্ড যুক্ত করা হয়নি।
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(e.expense_date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-950">
                        {e.expense_title}
                        {e.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {e.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {getBanglaCategoryName(e.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700 whitespace-nowrap">
                        {formatBDT(e.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
