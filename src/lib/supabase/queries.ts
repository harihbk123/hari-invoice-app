// src/lib/supabase/queries.ts
import { supabase } from '@/lib/supabase';
import type { Client, Invoice, Expense, Settings } from '@/types';

// Client Queries
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Client query error:', error);
    throw error;
  }
}

export async function getClient(id: string): Promise<Client> {
  try {
    if (!id) throw new Error('Client ID is required');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      throw new Error(`Failed to fetch client: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Client not found');
    }
    
    return data;
  } catch (error) {
    console.error('Get client error:', error);
    throw error;
  }
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw new Error(`Failed to create client: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Create client error:', error);
    throw error;
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  try {
    if (!id) throw new Error('Client ID is required');

    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw new Error(`Failed to update client: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Update client error:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    if (!id) throw new Error('Client ID is required');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete client error:', error);
    throw error;
  }
}

// Invoice Queries
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company,
          phone,
          address
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Invoice query error:', error);
    throw error;
  }
}

export async function getInvoice(id: string): Promise<Invoice> {
  try {
    if (!id) throw new Error('Invoice ID is required');

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company,
          phone,
          address
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Invoice not found');
    }
    
    return data;
  } catch (error) {
    console.error('Get invoice error:', error);
    throw error;
  }
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  try {
    if (!clientId) throw new Error('Client ID is required');

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client invoices:', error);
      throw new Error(`Failed to fetch client invoices: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Client invoices query error:', error);
    throw error;
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{
        ...invoice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Create invoice error:', error);
    throw error;
  }
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  try {
    if (!id) throw new Error('Invoice ID is required');

    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Update invoice error:', error);
    throw error;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    if (!id) throw new Error('Invoice ID is required');

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete invoice error:', error);
    throw error;
  }
}

export async function changeInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
  try {
    if (!id) throw new Error('Invoice ID is required');
    if (!status) throw new Error('Status is required');

    return updateInvoice(id, { status });
  } catch (error) {
    console.error('Change invoice status error:', error);
    throw error;
  }
}

export async function getNextInvoiceNumber(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting next invoice number:', error);
      throw new Error(`Failed to get next invoice number: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 'INV-001';
    }

    const lastInvoiceNumber = data[0].invoice_number;
    if (!lastInvoiceNumber) {
      return 'INV-001';
    }

    const match = lastInvoiceNumber.match(/(\d+)$/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${nextNumber.toString().padStart(3, '0')}`;
    }

    return 'INV-001';
  } catch (error) {
    console.error('Get next invoice number error:', error);
    throw error;
  }
}

// Expense Queries
export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Expense query error:', error);
    throw error;
  }
}

export async function getExpense(id: string): Promise<Expense> {
  try {
    if (!id) throw new Error('Expense ID is required');

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching expense:', error);
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Expense not found');
    }
    
    return data;
  } catch (error) {
    console.error('Get expense error:', error);
    throw error;
  }
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        ...expense,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Create expense error:', error);
    throw error;
  }
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  try {
    if (!id) throw new Error('Expense ID is required');

    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Update expense error:', error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    if (!id) throw new Error('Expense ID is required');

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete expense error:', error);
    throw error;
  }
}

// Settings Queries
export async function getSettings(): Promise<Settings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching settings:', error);
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }
    
    return data || null;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('settings')
      .upsert({ 
        ...settings, 
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
}

// Analytics Queries
export interface AnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  totalClients: number;
  totalInvoices: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  monthlyExpenses: Array<{ month: string; expenses: number }>;
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    // Get all data in parallel
    const [invoicesResult, expensesResult, clientsResult] = await Promise.all([
      supabase.from('invoices').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('clients').select('*')
    ]);

    if (invoicesResult.error) throw invoicesResult.error;
    if (expensesResult.error) throw expensesResult.error;
    if (clientsResult.error) throw clientsResult.error;

    const invoices = invoicesResult.data || [];
    const expenses = expensesResult.data || [];
    const clients = clientsResult.data || [];

    // Calculate totals
    const totalRevenue = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get monthly data for the last 12 months
    const monthlyRevenue = getMonthlyData(invoices, 'amount', 'Paid');
    const monthlyExpenses = getMonthlyData(expenses, 'amount');

    return {
      totalRevenue,
      totalExpenses,
      totalClients: clients.length,
      totalInvoices: invoices.length,
      monthlyRevenue: monthlyRevenue.map((m: any) => ({
        month: m.month,
        revenue: m.revenue ?? 0,
      })),
      monthlyExpenses: monthlyExpenses.map((m: any) => ({
        month: m.month,
        expenses: m.expenses ?? 0,
      })),
      recentInvoices: invoices.slice(0, 5),
      recentExpenses: expenses.slice(0, 5),
    };
  } catch (error) {
    console.error('Analytics query error:', error);
    throw error;
  }
}

// Helper function for monthly data calculation
function getMonthlyData(data: any[], amountField: string, statusFilter?: string) {
  const now = new Date();
  const months = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthData = data.filter(item => {
      const itemDate = new Date(item.created_at || item.date);
      const itemMonthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = itemMonthKey === monthKey;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesMonth && matchesStatus;
    });

    const total = monthData.reduce((sum, item) => sum + (item[amountField] || 0), 0);
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      [amountField === 'amount' && statusFilter ? 'revenue' : 'expenses']: total
    });
  }
  
  return months;
}
