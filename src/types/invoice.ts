// src/types/invoice.ts

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
  client?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
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

export interface InvoiceFormData {
  client_id: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  issue_date: string;
  due_date: string;
  description?: string;
  items?: InvoiceItem[];
}
