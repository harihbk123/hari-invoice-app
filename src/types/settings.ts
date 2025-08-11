// src/types/settings.ts

export interface Settings {
  id: string;
  user_id: string;
  company_name: string;
  company_email: string;
  company_phone: string | null;
  company_address: string | null;
  profile_gstin: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_branch: string | null;
  bank_ifsc: string | null;
  bank_swift: string | null;
  account_type: string | null;
  tax_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
  currency: string | null;
  invoice_prefix: string | null;
  profile_name: string | null;
  profile_email: string | null;
  profile_phone: string | null;
  profile_address: string | null;
  invoice_terms: string | null;
  default_currency: string | null;
}
