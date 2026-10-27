import { Profile, Contribution, Expense, AuditLog, FundSummary } from '@/types/database';
import { createClient as createServerClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { readLocalStore, writeLocalStore } from './fileStore';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !url.includes('your-project') &&
    !url.includes('example.com') &&
    !key.includes('placeholder')
  );
}

// -----------------------------------------------------------------------------
// FUND SUMMARY
// -----------------------------------------------------------------------------
export async function getFundSummary(): Promise<FundSummary> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.rpc('get_fund_summary');
      if (!error && data) {
        return {
          total_members: data.total_members || 0,
          active_members: data.total_members || 0,
          total_monthly_expected: data.total_expected || 0,
          total_collection: data.total_collection || 0,
          total_expenses: data.total_expenses || 0,
          current_balance: data.current_balance || 0,
          total_due: data.total_due || 0,
        };
      }
    } catch (e) {
      console.warn('Supabase get_fund_summary fallback to direct calculation:', e);
    }
  }

  // Local persistent store fallback
  const store = readLocalStore();
  const total_members = store.profiles.length;
  const active_members = store.profiles.filter((p) => p.member_status === 'active').length;
  const total_monthly_expected = store.profiles
    .filter((p) => p.member_status === 'active')
    .reduce((sum, p) => sum + (Number(p.monthly_contribution) || 0), 0);

  const total_collection = store.contributions.reduce((sum, c) => sum + (Number(c.paid_amount) || 0), 0);
  const total_expenses = store.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const current_balance = total_collection - total_expenses;

  const total_due = store.contributions.reduce((sum, c) => {
    const diff = (Number(c.expected_amount) || 0) - (Number(c.paid_amount) || 0);
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  return {
    total_members,
    active_members,
    total_monthly_expected,
    total_collection,
    total_expenses,
    current_balance,
    total_due,
  };
}

// -----------------------------------------------------------------------------
// PROFILES / MEMBERS
// -----------------------------------------------------------------------------
export async function getMembers(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && profiles) {
        const { data: contributions } = await supabase.from('contributions').select('*');
        const contList = contributions || [];

        return profiles.map((p) => {
          const userConts = contList.filter((c: any) => c.member_id === p.id);
          const total_paid = userConts.reduce((sum: number, c: any) => sum + Number(c.paid_amount || 0), 0);
          const total_due = userConts.reduce((sum: number, c: any) => {
            const due = Number(c.expected_amount || 0) - Number(c.paid_amount || 0);
            return sum + (due > 0 ? due : 0);
          }, 0);
          const sorted = [...userConts].sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
          const last_payment_date = sorted[0]?.payment_date || null;

          return {
            ...p,
            total_paid,
            total_due,
            last_payment_date,
          };
        });
      }
    } catch (e) {
      console.warn('Supabase getMembers fallback:', e);
    }
  }

  // Local persistent store
  const store = readLocalStore();
  return store.profiles.map((p) => {
    const userConts = store.contributions.filter((c) => c.member_id === p.id);
    const total_paid = userConts.reduce((sum, c) => sum + (Number(c.paid_amount) || 0), 0);
    const total_due = userConts.reduce((sum, c) => {
      const due = (Number(c.expected_amount) || 0) - (Number(c.paid_amount) || 0);
      return sum + (due > 0 ? due : 0);
    }, 0);
    const sorted = [...userConts].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
    const last_payment_date = sorted[0]?.payment_date || null;

    return {
      ...p,
      total_paid,
      total_due,
      last_payment_date,
    };
  });
}

export async function getMemberById(id: string): Promise<Profile | null> {
  const all = await getMembers();
  return all.find((m) => m.id === id || m.email === id || m.auth_user_id === id) || null;
}

export async function addMember(data: Omit<Profile, 'id' | 'created_at' | 'auth_user_id'>): Promise<Profile> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          role: data.role || 'member',
          monthly_contribution: Number(data.monthly_contribution) || 0,
          member_status: data.member_status || 'active',
        })
        .select()
        .single();

      if (!error && inserted) {
        await logAudit({
          action: 'INSERT_MEMBER',
          table_name: 'profiles',
          record_id: inserted.id,
          new_data: inserted,
        });
        return inserted;
      }
    } catch (e) {
      console.warn('Supabase addMember fallback:', e);
    }
  }

  const store = readLocalStore();
  const newProfile: Profile = {
    ...data,
    id: `member-${Date.now()}`,
    auth_user_id: null,
    created_at: new Date().toISOString(),
    total_paid: 0,
    total_due: 0,
    last_payment_date: null,
  };
  store.profiles.push(newProfile);
  writeLocalStore(store);

  await logAudit({
    action: 'INSERT_MEMBER',
    table_name: 'profiles',
    record_id: newProfile.id,
    new_data: newProfile,
  });
  return newProfile;
}

export async function updateMember(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({
          ...(updates.full_name && { full_name: updates.full_name }),
          ...(updates.phone !== undefined && { phone: updates.phone }),
          ...(updates.role && { role: updates.role }),
          ...(updates.monthly_contribution !== undefined && { monthly_contribution: Number(updates.monthly_contribution) }),
          ...(updates.member_status && { member_status: updates.member_status }),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        await logAudit({
          action: 'UPDATE_MEMBER',
          table_name: 'profiles',
          record_id: id,
          new_data: updated,
        });
        return updated;
      }
    } catch (e) {
      console.warn('Supabase updateMember fallback:', e);
    }
  }

  const store = readLocalStore();
  const idx = store.profiles.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = { ...store.profiles[idx] };
  store.profiles[idx] = { ...store.profiles[idx], ...updates, updated_at: new Date().toISOString() };
  writeLocalStore(store);

  await logAudit({
    action: 'UPDATE_MEMBER',
    table_name: 'profiles',
    record_id: id,
    previous_data: prev,
    new_data: store.profiles[idx],
  });
  return store.profiles[idx];
}

// -----------------------------------------------------------------------------
// CONTRIBUTIONS
// -----------------------------------------------------------------------------
export async function getContributions(filters?: {
  memberId?: string;
  year?: number;
  month?: number;
  status?: string;
}): Promise<Contribution[]> {
  const members = await getMembers();
  const memberMap = new Map(members.map((m) => [m.id, m]));

  let list: Contribution[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      let query = supabase.from('contributions').select('*, member:profiles(id, full_name, email, role)').order('payment_date', { ascending: false });

      if (filters?.memberId) query = query.eq('member_id', filters.memberId);
      if (filters?.year) query = query.eq('contribution_year', filters.year);
      if (filters?.month) query = query.eq('contribution_month', filters.month);

      const { data, error } = await query;
      if (!error && data) {
        list = data.map((item: any) => ({
          ...item,
          member: item.member || memberMap.get(item.member_id),
        }));
      }
    } catch (e) {
      console.warn('Supabase getContributions fallback:', e);
    }
  }

  if (list.length === 0 && !isSupabaseConfigured()) {
    const store = readLocalStore();
    list = store.contributions.map((c) => ({
      ...c,
      member: memberMap.get(c.member_id) ? {
        id: c.member_id,
        full_name: memberMap.get(c.member_id)!.full_name,
        email: memberMap.get(c.member_id)!.email,
        role: memberMap.get(c.member_id)!.role,
      } : undefined,
    }));

    if (filters?.memberId) {
      list = list.filter((c) => c.member_id === filters.memberId);
    }
    if (filters?.year) {
      list = list.filter((c) => c.contribution_year === Number(filters.year));
    }
    if (filters?.month) {
      list = list.filter((c) => c.contribution_month === Number(filters.month));
    }
  }

  if (filters?.status) {
    list = list.filter((c) => {
      const expected = Number(c.expected_amount) || 0;
      const paid = Number(c.paid_amount) || 0;
      let status: 'paid' | 'partial' | 'due' = 'paid';
      if (paid === 0) status = 'due';
      else if (paid < expected) status = 'partial';
      return status === filters.status;
    });
  }

  return list;
}

export async function addContribution(data: Omit<Contribution, 'id' | 'created_at'>): Promise<Contribution> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: inserted, error } = await supabase
        .from('contributions')
        .insert({
          member_id: data.member_id,
          contribution_month: data.contribution_month,
          contribution_year: data.contribution_year,
          expected_amount: Number(data.expected_amount) || 0,
          paid_amount: Number(data.paid_amount) || 0,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          transaction_reference: data.transaction_reference || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (!error && inserted) {
        await logAudit({
          action: 'INSERT_CONTRIBUTION',
          table_name: 'contributions',
          record_id: inserted.id,
          new_data: inserted,
        });
        return inserted;
      }
    } catch (e) {
      console.warn('Supabase addContribution fallback:', e);
    }
  }

  const store = readLocalStore();
  const newContrib: Contribution = {
    ...data,
    id: `contrib-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  store.contributions.unshift(newContrib);
  writeLocalStore(store);

  await logAudit({
    action: 'INSERT_CONTRIBUTION',
    table_name: 'contributions',
    record_id: newContrib.id,
    new_data: newContrib,
  });
  return newContrib;
}

export async function updateContribution(id: string, updates: Partial<Contribution>): Promise<Contribution | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: updated, error } = await supabase
        .from('contributions')
        .update({
          ...(updates.contribution_month && { contribution_month: updates.contribution_month }),
          ...(updates.contribution_year && { contribution_year: updates.contribution_year }),
          ...(updates.expected_amount !== undefined && { expected_amount: Number(updates.expected_amount) }),
          ...(updates.paid_amount !== undefined && { paid_amount: Number(updates.paid_amount) }),
          ...(updates.payment_date && { payment_date: updates.payment_date }),
          ...(updates.payment_method && { payment_method: updates.payment_method }),
          ...(updates.transaction_reference !== undefined && { transaction_reference: updates.transaction_reference }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        await logAudit({
          action: 'UPDATE_CONTRIBUTION',
          table_name: 'contributions',
          record_id: id,
          new_data: updated,
        });
        return updated;
      }
    } catch (e) {
      console.warn('Supabase updateContribution fallback:', e);
    }
  }

  const store = readLocalStore();
  const idx = store.contributions.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const prev = { ...store.contributions[idx] };
  store.contributions[idx] = { ...store.contributions[idx], ...updates, updated_at: new Date().toISOString() };
  writeLocalStore(store);

  await logAudit({
    action: 'UPDATE_CONTRIBUTION',
    table_name: 'contributions',
    record_id: id,
    previous_data: prev,
    new_data: store.contributions[idx],
  });
  return store.contributions[idx];
}

export async function deleteContribution(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { error } = await supabase.from('contributions').delete().eq('id', id);
      if (!error) {
        await logAudit({
          action: 'DELETE_CONTRIBUTION',
          table_name: 'contributions',
          record_id: id,
        });
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteContribution fallback:', e);
    }
  }

  const store = readLocalStore();
  const idx = store.contributions.findIndex((c) => c.id === id);
  if (idx !== -1) {
    const deleted = store.contributions.splice(idx, 1)[0];
    writeLocalStore(store);
    await logAudit({
      action: 'DELETE_CONTRIBUTION',
      table_name: 'contributions',
      record_id: id,
      previous_data: deleted,
    });
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// EXPENSES
// -----------------------------------------------------------------------------
export async function getExpenses(): Promise<Expense[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*, creator:profiles(full_name)')
        .order('expense_date', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase getExpenses fallback:', e);
    }
  }

  const store = readLocalStore();
  return [...store.expenses].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
}

export async function addExpense(data: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert({
          expense_title: data.expense_title,
          category: data.category,
          amount: Number(data.amount) || 0,
          expense_date: data.expense_date,
          description: data.description || null,
          receipt_url: data.receipt_url || null,
          created_by: data.created_by || null,
        })
        .select()
        .single();

      if (!error && inserted) {
        await logAudit({
          action: 'INSERT_EXPENSE',
          table_name: 'expenses',
          record_id: inserted.id,
          new_data: inserted,
        });
        return inserted;
      }
    } catch (e) {
      console.warn('Supabase addExpense fallback:', e);
    }
  }

  const store = readLocalStore();
  const newExpense: Expense = {
    ...data,
    id: `expense-${Date.now()}`,
    created_at: new Date().toISOString(),
    creator: { full_name: 'Md Samiul Islam' },
  };
  store.expenses.unshift(newExpense);
  writeLocalStore(store);

  await logAudit({
    action: 'INSERT_EXPENSE',
    table_name: 'expenses',
    record_id: newExpense.id,
    new_data: newExpense,
  });
  return newExpense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data: updated, error } = await supabase
        .from('expenses')
        .update({
          ...(updates.expense_title && { expense_title: updates.expense_title }),
          ...(updates.category && { category: updates.category }),
          ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
          ...(updates.expense_date && { expense_date: updates.expense_date }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.receipt_url !== undefined && { receipt_url: updates.receipt_url }),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        await logAudit({
          action: 'UPDATE_EXPENSE',
          table_name: 'expenses',
          record_id: id,
          new_data: updated,
        });
        return updated;
      }
    } catch (e) {
      console.warn('Supabase updateExpense fallback:', e);
    }
  }

  const store = readLocalStore();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const prev = { ...store.expenses[idx] };
  store.expenses[idx] = { ...store.expenses[idx], ...updates, updated_at: new Date().toISOString() };
  writeLocalStore(store);

  await logAudit({
    action: 'UPDATE_EXPENSE',
    table_name: 'expenses',
    record_id: id,
    previous_data: prev,
    new_data: store.expenses[idx],
  });
  return store.expenses[idx];
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (!error) {
        await logAudit({
          action: 'DELETE_EXPENSE',
          table_name: 'expenses',
          record_id: id,
        });
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteExpense fallback:', e);
    }
  }

  const store = readLocalStore();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx !== -1) {
    const deleted = store.expenses.splice(idx, 1)[0];
    writeLocalStore(store);
    await logAudit({
      action: 'DELETE_EXPENSE',
      table_name: 'expenses',
      record_id: id,
      previous_data: deleted,
    });
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------------------
export async function logAudit(entry: Omit<AuditLog, 'id' | 'created_at' | 'user_id'> & { user_id?: string | null }): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      await supabase.from('audit_logs').insert({
        user_id: entry.user_id || null,
        action: entry.action,
        table_name: entry.table_name,
        record_id: entry.record_id || null,
        previous_data: entry.previous_data || null,
        new_data: entry.new_data || null,
      });
      return;
    } catch (e) {
      console.warn('Supabase logAudit fallback:', e);
    }
  }

  const store = readLocalStore();
  store.auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: entry.user_id || null,
    action: entry.action,
    table_name: entry.table_name,
    record_id: entry.record_id || null,
    previous_data: entry.previous_data,
    new_data: entry.new_data,
    created_at: new Date().toISOString(),
  });
  writeLocalStore(store);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createServerClient();
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getAuditLogs fallback:', e);
    }
  }

  const store = readLocalStore();
  return store.auditLogs;
}
