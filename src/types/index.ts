// src/types/index.ts

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  issue_date: string;
  due_date: string;
  description?: string;
  items?: InvoiceItem[];
  client?: Client;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

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

export interface Settings {
  id: string;
  user_id: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  default_currency?: string;
  tax_rate?: number;
  invoice_terms?: string;
  created_at?: string;
  updated_at?: string;
}

// Form data types
export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  status?: 'active' | 'inactive';
}

export interface InvoiceFormData {
  client_id: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  issue_date: string;
  due_date: string;
  description?: string;
  items?: InvoiceItem[];
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  is_reimbursable?: boolean;
}
