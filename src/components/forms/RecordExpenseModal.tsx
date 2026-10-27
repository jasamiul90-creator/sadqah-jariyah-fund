'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Expense, ExpenseCategory } from '@/types/database';
import { EXPENSE_CATEGORIES } from '@/lib/bangla';
import { Loader2, PlusCircle, Check } from 'lucide-react';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingExpense?: Expense | null;
  onSuccess: () => void;
}

export default function RecordExpenseModal({
  isOpen,
  onClose,
  existingExpense,
  onSuccess,
}: RecordExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Charity');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingExpense) {
      setTitle(existingExpense.expense_title);
      setCategory(existingExpense.category);
      setAmount(existingExpense.amount);
      setDate(existingExpense.expense_date);
      setDescription(existingExpense.description || '');
      setReceiptUrl(existingExpense.receipt_url || '');
    } else {
      setTitle('');
      setCategory('Charity');
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setReceiptUrl('');
    }
  }, [existingExpense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      setError('ব্যয়ের শিরোনাম ও পরিমাণ আবশ্যক');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const url = existingExpense ? `/api/expenses/${existingExpense.id}` : '/api/expenses';
      const method = existingExpense ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense_title: title,
          category,
          amount,
          expense_date: date,
          description,
          receipt_url: receiptUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ব্যয় রেকর্ড সংরক্ষণ করতে সমস্যা হয়েছে');
      }

      onSuccess();
      onClose();
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
      title={existingExpense ? 'ব্যয়ের বিবরণ সংশোধন' : 'নতুন তহবিল ব্যয় এন্ট্রি'}
      subtitle="তহবিল ব্যয়ের স্বচ্ছ বিবরণী ও রশিদ সংরক্ষণ করুন"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ব্যয়ের খাত / শিরোনাম <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="উদা: এতিম পরিবারের খাদ্য সহায়তা বা মাদ্রাসায় আর্থিক অনুদান"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ব্যয়ের ক্যাটাগরি <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.bn} ({c.en})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ব্যয়ের পরিমাণ (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-rose-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ব্যয়ের তারিখ</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="প্রাপকের বিবরণ, উদ্দেশ্য ও প্রাসঙ্গিক নোট..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ভাউচার / রসিদের লিংক বা ছবি URL (ঐচ্ছিক)
          </label>
          <input
            type="url"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="https://example.com/receipt.jpg"
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
            {existingExpense ? 'হালনাগাদ করুন' : 'ব্যয় লিপিবদ্ধ করুন'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
