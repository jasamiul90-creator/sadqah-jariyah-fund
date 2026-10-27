'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Profile, Contribution, PaymentMethod } from '@/types/database';
import { BANGLA_MONTHS, toBengaliNumber } from '@/lib/bangla';
import { Loader2, DollarSign, Check } from 'lucide-react';

interface EnterContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Profile[];
  initialMemberId?: string;
  existingRecord?: Contribution | null;
  onSuccess: () => void;
}

export default function EnterContributionModal({
  isOpen,
  onClose,
  members,
  initialMemberId,
  existingRecord,
  onSuccess,
}: EnterContributionModalProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [memberId, setMemberId] = useState(initialMemberId || '');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [expectedAmount, setExpectedAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When selected member changes or modal opens
  useEffect(() => {
    if (existingRecord) {
      setMemberId(existingRecord.member_id);
      setMonth(existingRecord.contribution_month);
      setYear(existingRecord.contribution_year);
      setExpectedAmount(existingRecord.expected_amount);
      setPaidAmount(existingRecord.paid_amount);
      setPaymentDate(existingRecord.payment_date);
      setPaymentMethod(existingRecord.payment_method);
      setTransactionRef(existingRecord.transaction_reference || '');
      setNotes(existingRecord.notes || '');
    } else {
      const selected = members.find((m) => m.id === (initialMemberId || memberId));
      if (selected) {
        setExpectedAmount(selected.monthly_contribution || 0);
        setPaidAmount(selected.monthly_contribution || 0);
      }
      if (initialMemberId) setMemberId(initialMemberId);
    }
  }, [existingRecord, initialMemberId, members]);

  const handleMemberChange = (id: string) => {
    setMemberId(id);
    const member = members.find((m) => m.id === id);
    if (member) {
      setExpectedAmount(member.monthly_contribution || 0);
      setPaidAmount(member.monthly_contribution || 0);
    }
  };

  const calculatedStatus = () => {
    const exp = Number(expectedAmount) || 0;
    const paid = Number(paidAmount) || 0;
    if (paid >= exp && exp > 0) return { label: 'পরিশোধিত (Paid)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (paid > 0 && paid < exp) return { label: 'আংশিক পরিশোধ (Partial)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'বকেয়া (Due)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
      setError('অনুগ্রহ করে একজন সদস্য নির্বাচন করুন');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const url = existingRecord ? `/api/contributions/${existingRecord.id}` : '/api/contributions';
      const method = existingRecord ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          contribution_month: month,
          contribution_year: year,
          expected_amount: expectedAmount,
          paid_amount: paidAmount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          transaction_reference: transactionRef,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'চাঁদা এন্ট্রি করতে সমস্যা হয়েছে');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = calculatedStatus();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingRecord ? 'চাঁদার তথ্য সংশোধন' : 'নতুন মাসিক চাঁদা এন্ট্রি'}
      subtitle="সদস্যের মাসিক অবদানের হিসাব সংরক্ষণ করুন"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Member Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            সদস্য নির্বাচন করুন <span className="text-rose-500">*</span>
          </label>
          <select
            value={memberId}
            onChange={(e) => handleMemberChange(e.target.value)}
            disabled={Boolean(existingRecord)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white disabled:bg-gray-100"
          >
            <option value="">-- সদস্য নির্বাচন করুন --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.email}) - নির্ধারিত: ৳{toBengaliNumber(m.monthly_contribution)}
              </option>
            ))}
          </select>
        </div>

        {/* Month & Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">মাসের নাম</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
            >
              {BANGLA_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} ({m.en})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">বছর</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {toBengaliNumber(y)} ({y})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expected vs Actual Paid Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ধার্যকৃত চাঁদা (Expected ৳)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={expectedAmount}
              onChange={(e) => setExpectedAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              প্রকৃত আদায় (Paid ৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="50"
              required
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-emerald-950"
            />
          </div>
        </div>

        {/* Auto Status Banner */}
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${status.color}`}>
          <span>পেমেন্ট স্ট্যাটাস:</span>
          <span className="font-bold">{status.label}</span>
        </div>

        {/* Date and Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">পরিশোধের তারিখ</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">পরিশোধের মাধ্যম</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
            >
              <option value="bKash">বিকাশ (bKash)</option>
              <option value="Nagad">নগদ (Nagad)</option>
              <option value="Rocket">রকেট (Rocket)</option>
              <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank)</option>
              <option value="Cash">নগদ গ্রহণ (Cash)</option>
              <option value="Other">অন্যান্য (Other)</option>
            </select>
          </div>
        </div>

        {/* Transaction Reference & Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ট্রানজেকশন আইডি / রেফারেন্স</label>
          <input
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="উদা: BK9X2810L বা রসিদ নং"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="উদা: দুই মাসের বকেয়া পরিশোধ"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {existingRecord ? 'আপডেট করুন' : 'চাঁদা জমা দিন'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
