// src/lib/supabase/queries.ts
import { supabase } from '@/lib/supabase';
import type { Client, Invoice, Expense, Settings } from '@/types';

// Client Queries
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Invoice Queries
export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        id,
        name,
        email,
        company
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        id,
        name,
        email,
        company
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function changeInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
  return updateInvoice(id, { status });
}

export async function getNextInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return 'INV-001';
  }

  const lastInvoiceNumber = data[0].invoice_number;
  const match = lastInvoiceNumber.match(/(\d+)$/);
  
  if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    return `INV-${nextNumber.toString().padStart(3, '0')}`;
  }

  return 'INV-001';
}

// Expense Queries
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getExpense(id: string): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Settings Queries
export async function getSettings(): Promise<Settings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data || null;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('settings')
    .upsert({ ...settings, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Analytics Queries
export interface AnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  totalClients: number;
  totalInvoices: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  clientRevenue: Array<{ client: string; revenue: number }>;
  invoiceStatusDistribution: Array<{ status: string; count: number }>;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Fetch all data in parallel
    const [invoicesResult, clientsResult, expensesResult] = await Promise.all([
      supabase.from('invoices').select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `),
      supabase.from('clients').select('*'),
      supabase.from('expenses').select('*')
    ]);

    const invoices = invoicesResult.data || [];
    const clients = clientsResult.data || [];
    const expenses = expensesResult.data || [];

    // Calculate basic metrics
    const totalRevenue = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Monthly revenue calculation
    const monthlyRevenue = calculateMonthlyRevenue(invoices);
    
    // Expenses by category
    const expensesByCategory = calculateExpensesByCategory(expenses);
    
    // Client revenue
    const clientRevenue = calculateClientRevenue(invoices);
    
    // Invoice status distribution
    const invoiceStatusDistribution = calculateInvoiceStatusDistribution(invoices);

    return {
      totalRevenue,
      totalExpenses,
      totalClients: clients.length,
      totalInvoices: invoices.length,
      monthlyRevenue,
      expensesByCategory,
      clientRevenue,
      invoiceStatusDistribution
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

// Helper functions for analytics calculations
function calculateMonthlyRevenue(invoices: any[]): Array<{ month: string; revenue: number }> {
  const monthlyData = new Map<string, number>();
  
  invoices
    .filter(inv => inv.status === 'Paid')
    .forEach(invoice => {
      const date = new Date(invoice.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      monthlyData.set(monthName, (monthlyData.get(monthName) || 0) + invoice.amount);
    });
  
  return Array.from(monthlyData.entries()).map(([month, revenue]) => ({
    month,
    revenue
  }));
}

function calculateExpensesByCategory(expenses: any[]): Array<{ category: string; amount: number }> {
  const categoryData = new Map<string, number>();
  
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    categoryData.set(category, (categoryData.get(category) || 0) + expense.amount);
  });
  
  return Array.from(categoryData.entries()).map(([category, amount]) => ({
    category,
    amount
  }));
}

function calculateClientRevenue(invoices: any[]): Array<{ client: string; revenue: number }> {
  const clientData = new Map<string, number>();
  
  invoices
    .filter(inv => inv.status === 'Paid')
    .forEach(invoice => {
      const clientName = invoice.clients?.name || 'Unknown Client';
      clientData.set(clientName, (clientData.get(clientName) || 0) + invoice.amount);
    });
  
  return Array.from(clientData.entries())
    .map(([client, revenue]) => ({ client, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 clients
}

function calculateInvoiceStatusDistribution(invoices: any[]): Array<{ status: string; count: number }> {
  const statusData = new Map<string, number>();
  
  invoices.forEach(invoice => {
    const status = invoice.status || 'Unknown';
    statusData.set(status, (statusData.get(status) || 0) + 1);
  });
  
  return Array.from(statusData.entries()).map(([status, count]) => ({
    status,
    count
  }));
}
