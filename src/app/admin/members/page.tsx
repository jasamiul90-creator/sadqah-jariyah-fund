'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit3, 
  KeyRound, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react';
import { Profile } from '@/types/database';
import { formatBDT, toBengaliNumber, ROLE_LABELS, STATUS_LABELS } from '@/lib/bangla';
import AddMemberModal from '@/components/forms/AddMemberModal';
import EditMemberModal from '@/components/forms/EditMemberModal';
import ResetPasswordModal from '@/components/forms/ResetPasswordModal';
import EnterContributionModal from '@/components/forms/EnterContributionModal';

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Member for Actions
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [contribModalOpen, setContribModalOpen] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-700" />
            <span>সদস্য ব্যবস্থাপনা (Member Management)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            মোট ২৫ জন নিবন্ধিত সদস্যের তথ্য, মাসিক চাঁদার হার নির্ধারণ ও অ্যাকাউন্ট নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন সদস্য যোগ</span>
          </button>

          <button
            onClick={fetchMembers}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-800 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="সদস্যের নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
          className="w-full text-sm outline-none bg-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>মোট প্রদর্শিত সদস্য: {toBengaliNumber(filteredMembers.length)} জন</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">সদস্যের নাম</th>
                <th className="py-3.5 px-4 font-semibold">পদবী / ভূমিকা</th>
                <th className="py-3.5 px-4 font-semibold text-right">নির্ধারিত মাসিক চাঁদা</th>
                <th className="py-3.5 px-4 font-semibold text-right">মোট পরিশোধ</th>
                <th className="py-3.5 px-4 font-semibold text-right">মোট বকেয়া</th>
                <th className="py-3.5 px-4 font-semibold text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    কোনো সদস্য খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-emerald-950">
                      <div className="font-bold">{m.full_name}</div>
                      <div className="text-[11px] text-gray-400 font-normal">{m.email}</div>
                      {m.phone && <div className="text-[11px] text-gray-400 font-normal">{m.phone}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {ROLE_LABELS[m.role]?.bn || m.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
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
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Enter Contribution for this Member */}
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setContribModalOpen(true);
                          }}
                          title="চাঁদা এন্ট্রি করুন"
                          className="p-1.5 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>

                        {/* Edit Member Details & Contribution rate */}
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setEditModalOpen(true);
                          }}
                          title="তথ্য ও মাসিক চাঁদা পরিবর্তন"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setResetModalOpen(true);
                          }}
                          title="পাসওয়ার্ড রিসেট"
                          className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
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

      {/* Modals */}
      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchMembers}
      />

      <EditMemberModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        member={selectedMember}
        onSuccess={fetchMembers}
      />

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        member={selectedMember}
      />

      <EnterContributionModal
        isOpen={contribModalOpen}
        onClose={() => setContribModalOpen(false)}
        members={members}
        initialMemberId={selectedMember?.id}
        onSuccess={fetchMembers}
      />
    </div>
  );
}
