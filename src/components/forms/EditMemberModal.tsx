'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Profile } from '@/types/database';
import { Loader2, Check } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Profile | null;
  onSuccess: () => void;
}

export default function EditMemberModal({ isOpen, onClose, member, onSuccess }: EditMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'committee' | 'member'>('member');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [memberStatus, setMemberStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFullName(member.full_name);
      setPhone(member.phone || '');
      setRole(member.role);
      setMonthlyContribution(member.monthly_contribution || 0);
      setMemberStatus(member.member_status || 'active');
      setError('');
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          role,
          monthly_contribution: monthlyContribution,
          member_status: memberStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সদস্যের তথ্য আপডেট করতে ব্যর্থ হয়েছে');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdminProfile = member?.role === 'admin';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="সদস্যের তথ্য পরিবর্তন করুন"
      subtitle={`${member?.full_name} (${member?.email})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            সদস্যের পুরো নাম <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">মোবাইল নম্বর</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="017xxxxxxxx"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              মাসিক নির্ধারিত চাঁদা (৳)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">সদস্যের ভূমিকা</label>
            <select
              value={role}
              disabled={isAdminProfile}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white disabled:bg-gray-100"
            >
              {isAdminProfile ? (
                <option value="admin">প্রধান অ্যাডমিন (Only 1)</option>
              ) : (
                <>
                  <option value="member">সাধারণ সদস্য (Member)</option>
                  <option value="committee">কার্যকরী পরিষদ (Committee)</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="status"
                value="active"
                checked={memberStatus === 'active'}
                onChange={() => setMemberStatus('active')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="text-emerald-800 font-medium">সক্রিয় (Active)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={memberStatus === 'inactive'}
                onChange={() => setMemberStatus('inactive')}
                disabled={isAdminProfile}
                className="text-gray-600 focus:ring-gray-500"
              />
              <span className="text-gray-600 font-medium">নিষ্ক্রিয় (Inactive)</span>
            </label>
          </div>
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
            সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </Modal>
  );
}
