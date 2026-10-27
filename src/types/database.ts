export type UserRole = 'admin' | 'committee' | 'member';
export type MemberStatus = 'active' | 'inactive';
export type PaymentStatus = 'paid' | 'partial' | 'due';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Cash' | 'Other';
export type ExpenseCategory = 
  | 'Charity' 
  | 'Medical Assistance' 
  | 'Food Assistance' 
  | 'Islamic Activities' 
  | 'Mosque or Madrasa' 
  | 'Other';

export interface Profile {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  monthly_contribution: number;
  member_status: MemberStatus;
  created_at: string;
  updated_at?: string;
  
  // Computed aggregations for convenience
  total_paid?: number;
  total_due?: number;
  last_payment_date?: string | null;
}

export interface Contribution {
  id: string;
  member_id: string;
  contribution_month: number; // 1-12
  contribution_year: number;
  expected_amount: number;
  paid_amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;

  // Joined fields
  member?: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
  };
}

export interface Expense {
  id: string;
  expense_title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  description?: string | null;
  receipt_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;

  creator?: {
    full_name: string;
  };
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id?: string | null;
  previous_data?: any;
  new_data?: any;
  created_at: string;
}

export interface FundSummary {
  total_members: number;
  active_members: number;
  total_monthly_expected: number;
  total_collection: number;
  total_expenses: number;
  current_balance: number;
  total_due: number;
}
