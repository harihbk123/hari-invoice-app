// src/types/index.ts

// Re-export all types from individual files
export * from './client';
export * from './invoice';
export * from './expense';

// Settings type (kept here as it's not in a separate file)
export interface Settings {
  id: string;
  user_id: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_logo?: string;
  default_currency?: string;
  tax_rate?: number;
  invoice_terms?: string;
  invoice_prefix?: string;
  
  // Profile information
  profile_name?: string;
  profile_email?: string;
  profile_phone?: string;
  profile_address?: string;
  profile_gstin?: string;
  
  // Banking information
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  bank_swift?: string;
  
  created_at?: string;
  updated_at?: string;
}

// Additional form types if not in separate files
export interface SettingsFormData {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  default_currency?: string;
  tax_rate?: number;
  invoice_terms?: string;
  profile_name?: string;
  profile_email?: string;
  profile_phone?: string;
  profile_address?: string;
  profile_gstin?: string;
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  bank_ifsc?: string;
}
