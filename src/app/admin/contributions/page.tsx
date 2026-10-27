'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Contribution, Profile } from '@/types/database';
import { BANGLA_MONTHS, formatBDT, toBengaliNumber, getBanglaMonthName, STATUS_LABELS, formatDate } from '@/lib/bangla';
import EnterContributionModal from '@/components/forms/EnterContributionModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ContributionsAdminPage() {
  const currentYear = new Date().getFullYear();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMember, setFilterMember] = useState('');
  const [filterYear, setFilterYear] = useState<number | ''>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Modals & Dialogs
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Contribution | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Contribution | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contRes, memRes] = await Promise.all([
        fetch('/api/contributions').then((r) => r.json()),
        fetch('/api/members').then((r) => r.json()),
      ]);

      if (contRes.contributions) setContributions(contRes.contributions);
      if (memRes.members) setMembers(memRes.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/contributions/${deletingRecord.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingRecord(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter logic
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-700" />
            <span>মাসিক চাঁদা এন্ট্রি ও খতিয়ান</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            সদস্যদের নিয়মিত মাসিক অনুদান এন্ট্রি, বকেয়া পর্যবেক্ষণ ও পূর্বের রেকর্ড সংশোধন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingRecord(null);
              setEntryModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন চাঁদা এন্ট্রি</span>
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

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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

      {/* Contributions Table */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>মোট রেকর্ড সংখ্যা: {toBengaliNumber(filteredContributions.length)} টি</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">সদস্যের নাম</th>
                <th className="py-3.5 px-4 font-semibold">মাস ও বছর</th>
                <th className="py-3.5 px-4 font-semibold text-right">ধার্যকৃত (Expected)</th>
                <th className="py-3.5 px-4 font-semibold text-right">প্রদত্ত (Paid)</th>
                <th className="py-3.5 px-4 font-semibold text-right">বকেয়া (Due)</th>
                <th className="py-3.5 px-4 font-semibold text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold">মাধ্যম ও তারিখ</th>
                <th className="py-3.5 px-4 font-semibold">রেফারেন্স / Trx</th>
                <th className="py-3.5 px-4 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium">কোনো চাঁদার রেকর্ড খুঁজে পাওয়া যায়নি।</p>
                    <p className="text-xs text-gray-400 mt-1">উপরে &apos;নতুন চাঁদা এন্ট্রি&apos; বোতামে ক্লিক করে রেকর্ড যুক্ত করুন।</p>
                  </td>
                </tr>
              ) : (
                filteredContributions.map((c) => {
                  const expected = Number(c.expected_amount) || 0;
                  const paid = Number(c.paid_amount) || 0;
                  const due = Math.max(0, expected - paid);

                  let statusKey: 'paid' | 'partial' | 'due' = 'paid';
                  if (paid === 0) statusKey = 'due';
                  else if (paid < expected) statusKey = 'partial';

                  const statusInfo = STATUS_LABELS[statusKey];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-950">
                        {c.member?.full_name || 'সদস্য'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-gray-800">
                          {getBanglaMonthName(c.contribution_month)}
                        </span>{' '}
                        <span className="text-gray-400 font-mono">
                          {toBengaliNumber(c.contribution_year)}
                        </span>
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
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        {c.transaction_reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRecord(c);
                              setEntryModalOpen(true);
                            }}
                            title="সংশোধন"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(c)}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry / Edit Modal */}
      <EnterContributionModal
        isOpen={entryModalOpen}
        onClose={() => {
          setEntryModalOpen(false);
          setEditingRecord(null);
        }}
        members={members}
        existingRecord={editingRecord}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="চাঁদার রেকর্ড মুছে ফেলার নিশ্চয়তা"
        message={`আপনি কি নিশ্চিতভাবে এই চাঁদার রেকর্ডটি (${deletingRecord?.member?.full_name} - ${formatBDT(deletingRecord?.paid_amount)}) মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।`}
        isLoading={deleteLoading}
      />
    </div>
  );
}
