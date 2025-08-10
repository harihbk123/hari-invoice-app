// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// For client-side components - Updated to use @supabase/ssr
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export const dbHelpers = {
  // Clients
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createClient(client: any) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()
    return { data, error }
  },

  async updateClient(id: string, updates: any) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteClient(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Invoices
  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getInvoice(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createInvoice(invoice: any) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single()
    return { data, error }
  },

  async updateInvoice(id: string, updates: any) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Expenses
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .order('date_incurred', { ascending: false })
    return { data, error }
  },

  async getExpense(id: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createExpense(expense: any) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single()
    return { data, error }
  },

  async updateExpense(id: string, updates: any) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Expense Categories
  async getExpenseCategories() {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name')
    return { data, error }
  },

  async createExpenseCategory(category: any) {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert([category])
      .select()
      .single()
    return { data, error }
  },

  // Dashboard Analytics
  async getDashboardMetrics() {
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('amount, status, created_at')

    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount, date_incurred')

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, created_at')

    if (invoicesError || expensesError || clientsError) {
      return { 
        data: null, 
        error: invoicesError || expensesError || clientsError 
      }
    }

    return {
      data: {
        invoices: invoices || [],
        expenses: expenses || [],
        clients: clients || []
      },
      error: null
    }
  }
}
