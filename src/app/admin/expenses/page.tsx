'use client';

import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { Expense } from '@/types/database';
import { formatBDT, toBengaliNumber, getBanglaCategoryName, EXPENSE_CATEGORIES, formatDate } from '@/lib/bangla';
import RecordExpenseModal from '@/components/forms/RecordExpenseModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ExpensesAdminPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals & Dialogs
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.expenses) setExpenses(data.expenses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async () => {
    if (!deletingExpense) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingExpense(null);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.expense_title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-700" />
            <span>তহবিল ব্যয় ব্যবস্থাপনা (Expense Management)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            সদকা তহবিলের অর্থ কোন কল্যাণমূলক কাজে ব্যয় হয়েছে তা লিপিবদ্ধ ও নিরীক্ষণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingExpense(null);
              setExpenseModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন ব্যয় এন্ট্রি</span>
          </button>

          <button
            onClick={fetchExpenses}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-800 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 flex items-center gap-2 w-full">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ব্যয়ের খাত বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full text-xs sm:text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">সকল ক্যাটাগরি (All Categories)</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.bn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>মোট ব্যয়িত রেকর্ড: {toBengaliNumber(filteredExpenses.length)} টি</span>
          <span className="font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            সর্বমোট ব্যয়: {formatBDT(totalExpenseAmount)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">তারিখ (Date)</th>
                <th className="py-3.5 px-4 font-semibold">ব্যয়ের শিরোনাম ও বিবরণ</th>
                <th className="py-3.5 px-4 font-semibold">ক্যাটাগরি</th>
                <th className="py-3.5 px-4 font-semibold text-right">পরিমাণ (Amount)</th>
                <th className="py-3.5 px-4 font-semibold text-center">ভাউচার / রসিদ</th>
                <th className="py-3.5 px-4 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    এখনও কোনো ব্যয়ের রেকর্ড যুক্ত করা হয়নি।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(e.expense_date)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-emerald-950 font-medium">
                      <div className="font-bold">{e.expense_title}</div>
                      {e.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {e.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {getBanglaCategoryName(e.category)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-700 whitespace-nowrap">
                      {formatBDT(e.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {e.receipt_url ? (
                        <a
                          href={e.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                        >
                          <span>রসিদ দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(e);
                            setExpenseModalOpen(true);
                          }}
                          title="সংশোধন"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(e)}
                          title="মুছে ফেলুন"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      <RecordExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        existingExpense={editingExpense}
        onSuccess={fetchExpenses}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDelete}
        title="ব্যয় রেকর্ড মুছে ফেলার নিশ্চয়তা"
        message={`আপনি কি নিশ্চিতভাবে "${deletingExpense?.expense_title}" (${formatBDT(deletingExpense?.amount)}) ব্যয়ের রেকর্ডটি মুছে ফেলতে চান?`}
        isLoading={deleteLoading}
      />
    </div>
  );
}
