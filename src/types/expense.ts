// src/types/expense.ts
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  receipt_url?: string;
  is_reimbursable?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  is_reimbursable?: boolean;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  categories: {
    [key: string]: {
      amount: number;
      count: number;
    };
  };
  reimbursable: number;
  pending_reimbursement: number;
}
