// src/types/client.ts

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  contact_name?: string;
  payment_terms?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  
  // Dashboard statistics - these are computed/joined fields from database queries
  total_invoices?: number;
  total_revenue?: number;
  total_amount?: number;
}

export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  contact_name?: string;
  payment_terms?: string;
  status?: 'active' | 'inactive';
}

// Extended client interface for detailed views with additional computed data
export interface ClientWithStats extends Client {
  total_invoices: number;
  total_revenue: number;
  paid_invoices?: number;
  pending_invoices?: number;
  overdue_invoices?: number;
  average_invoice_value?: number;
  last_invoice_date?: string;
  last_payment_date?: string;
}
