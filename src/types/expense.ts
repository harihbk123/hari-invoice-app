// src/types/expense.ts

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  category_id?: string;
  category_name?: string;
  date?: string;
  date_incurred?: string;
  payment_method?: string;
  vendor_name?: string;
  receipt_number?: string;
  receipt_url?: string;
  is_business_expense?: boolean;
  is_reimbursable?: boolean;
  tax_deductible?: boolean;
  notes?: string;
  tags?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category?: string;
  category_id?: string;
  date?: string;
  date_incurred?: string;
  payment_method?: string;
  vendor_name?: string;
  is_business_expense?: boolean;
  is_reimbursable?: boolean;
  notes?: string;
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
