import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getContributions, getMemberById } from '@/lib/dbService';
import { formatBDT, toBengaliNumber, getBanglaMonthName, ROLE_LABELS, STATUS_LABELS, formatDate } from '@/lib/bangla';
import StatCard from '@/components/ui/StatCard';
import { 
  UserCircle, 
  CreditCard, 
  Wallet, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertTriangle 
} from 'lucide-react';

export const revalidate = 0;

export default async function MemberDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch full details of the logged in user
  const memberProfile = await getMemberById(user.id);
  const myContributions = await getContributions({ memberId: user.id });

  // Calculate personal metrics
  const monthlyExpected = Number(memberProfile?.monthly_contribution || 0);
  const totalPaid = myContributions.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);
  const totalDue = myContributions.reduce((sum, c) => {
    const due = Number(c.expected_amount || 0) - Number(c.paid_amount || 0);
    return sum + (due > 0 ? due : 0);
  }, 0);

  const sortedByDate = [...myContributions].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  const lastPayment = sortedByDate[0];

  const hasDuePayments = totalDue > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Member Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20">
            <UserCircle className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{user.full_name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-600">
                {ROLE_LABELS[user.role]?.bn || user.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              ইমেইল: {user.email} {user.phone ? `| মোবাইল: ${user.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right">
          <span className="text-xs text-emerald-200 block">আপনার নির্ধারিত মাসিক চাঁদা</span>
          <span className="text-2xl font-black text-amber-300">
            {formatBDT(monthlyExpected)}
          </span>
        </div>
      </div>

      {/* Due Payment Alert Notification */}
      {hasDuePayments && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-rose-900 animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base">
              আপনার বকেয়া চাঁদা জমা দেওয়ার জন্য বিনীত অনুরোধ
            </h3>
            <p className="text-xs sm:text-sm text-rose-700">
              আপনার সর্বমোট <strong>{formatBDT(totalDue)}</strong> টাকা বকেয়া রয়েছে। 
              অনুগ্রহ করে তহবিলের দায়িত্বশীলদের কাছে নির্ধারিত মাধ্যমে পরিশোধ সম্পন্ন করুন।
            </p>
          </div>
        </div>
      )}

      {/* Member Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="নির্ধারিত মাসিক চাঁদা"
          value={formatBDT(monthlyExpected)}
          subtitle="প্রতি মাসে ধার্যকৃত অনুদান"
          icon={CreditCard}
          variant="blue"
        />

        <StatCard
          title="সর্বমোট পরিশোধিত চাঁদা"
          value={formatBDT(totalPaid)}
          subtitle="এ যাবতকালে আপনার মোট অবদান"
          icon={Wallet}
          variant="emerald"
          badge="পরিশোধিত"
        />

        <StatCard
          title="মোট বকেয়া পরিমাণ"
          value={formatBDT(totalDue)}
          subtitle={totalDue === 0 ? 'আলহামদুলিল্লাহ কোনো বকেয়া নেই' : 'পরিশোধের অপেক্ষায়'}
          icon={AlertCircle}
          variant={totalDue > 0 ? 'rose' : 'emerald'}
          badge={totalDue > 0 ? 'বকেয়া' : 'পরিশোধ সম্পন্ন'}
        />

        <StatCard
          title="সর্বশেষ পরিশোধের তারিখ"
          value={lastPayment ? formatDate(lastPayment.payment_date) : 'এখনও নেই'}
          subtitle={lastPayment ? `পরিমাণ: ${formatBDT(lastPayment.paid_amount)}` : 'প্রথম এন্ট্রি বাকি'}
          icon={Calendar}
          variant="purple"
        />
      </div>

      {/* Personal Payment History Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
              ব্যক্তিগত মাসিক চাঁদা প্রদানের ইতিহাস
            </h2>
            <p className="text-xs text-gray-500">
              আপনার ব্যক্তিগত জমার বিবরণী (শুধুমাত্র আপনার জন্যই দৃশ্যমান)
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            মোট রেকর্ড: {toBengaliNumber(myContributions.length)} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">মাস</th>
                <th className="py-3.5 px-4 font-semibold">বছর</th>
                <th className="py-3.5 px-4 font-semibold text-right">ধার্যকৃত (Expected)</th>
                <th className="py-3.5 px-4 font-semibold text-right">প্রদত্ত (Paid)</th>
                <th className="py-3.5 px-4 font-semibold text-right">বকেয়া (Due)</th>
                <th className="py-3.5 px-4 font-semibold text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold">মাধ্যম ও তারিখ</th>
                <th className="py-3.5 px-4 font-semibold">রেফারেন্স / Trx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myContributions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium">আপনার অ্যাকাউন্টে এখনও কোনো পেমেন্ট রেকর্ড যুক্ত করা হয়নি।</p>
                    <p className="text-xs text-gray-400 mt-1">অ্যাডমিন আপনার পেমেন্ট এন্ট্রি করলে এখানে প্রদর্শিত হবে।</p>
                  </td>
                </tr>
              ) : (
                myContributions.map((c) => {
                  const expected = Number(c.expected_amount) || 0;
                  const paid = Number(c.paid_amount) || 0;
                  const due = Math.max(0, expected - paid);

                  let statusKey: 'paid' | 'partial' | 'due' = 'paid';
                  if (paid === 0) statusKey = 'due';
                  else if (paid < expected) statusKey = 'partial';

                  const statusInfo = STATUS_LABELS[statusKey];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-emerald-950">
                        {getBanglaMonthName(c.contribution_month)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono">
                        {toBengaliNumber(c.contribution_year)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                        {formatBDT(expected)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatBDT(paid)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        {due > 0 ? formatBDT(due) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          {statusInfo.bn}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{c.payment_method}</div>
                        <div className="text-[11px] text-gray-400">{formatDate(c.payment_date)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                        {c.transaction_reference || '—'}
                        {c.notes && <div className="text-[11px] text-gray-400 italic">{c.notes}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
