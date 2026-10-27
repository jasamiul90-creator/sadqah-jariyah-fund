'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Profile } from '@/types/database';
import { KeyRound, Loader2, Check } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Profile | null;
}

export default function ResetPasswordModal({ isOpen, onClose, member }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে');
      }

      setMessage(data.message || 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে!');
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="পাসওয়ার্ড রিসেট করুন"
      subtitle={`${member?.full_name} (${member?.email})`}
      maxWidth="md"
    >
      <form onSubmit={handleReset} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            {message}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            নতুন পাসওয়ার্ড নির্ধারণ করুন
          </label>
          <input
            type="text"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-mono"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            ডিফল্টভাবে &apos;123456&apos; দেওয়া আছে। সদস্য এই পাসওয়ার্ড দিয়ে লগইন করে পরবর্তীতে পরিবর্তন করতে পারবেন।
          </p>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            পাসওয়ার্ড রিসেট
          </button>
        </div>
      </form>
    </Modal>
  );
}
