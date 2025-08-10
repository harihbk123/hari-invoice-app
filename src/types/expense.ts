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

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  is_reimbursable?: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface ExpenseFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  searchTerm?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'check' | 'other';

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'check', 'other'];
