// src/types/invoice.ts

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issue_date: string;
  due_date: string;
  description?: string;
  subtotal?: number;
  tax?: number;
  items?: InvoiceItem[];
  
  // Nested client object (from joins)
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
  };
  
  // Alternative: Flattened client fields (from database views or denormalized data)
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_company?: string;
  
  // Metadata
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
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issue_date: string;
  due_date: string;
  invoice_number?: string;
  description?: string;
  items?: InvoiceItem[];
}
