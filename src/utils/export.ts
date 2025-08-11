import type { Invoice } from '@/types/invoice';
import type { Client } from '@/types/client';
import type { Expense } from '@/types/expense';
import { formatCurrency, formatDate } from './format';

// Export to CSV
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Invoices to CSV
export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const data = invoices.map(invoice => ({
    'Invoice Number': invoice.id,
  'Client': invoice.client_name,
  'Date Issued': formatDate(invoice.issue_date ?? ''),
  'Due Date': formatDate(invoice.due_date),
    'Status': invoice.status,
    'Subtotal': invoice.subtotal,
    'Tax': invoice.tax,
    'Total Amount': invoice.amount,
  'Items': (invoice.items ?? []).map((item: any) => `${item.description} (${item.quantity}x${item.rate})`).join('; ')
  }));

  exportToCSV(data, 'invoices');
}

// Export Clients to CSV
export function exportClientsToCSV(clients: Client[]): void {
  const data = clients.map(client => ({
    'Company Name': client.name,
  'Contact Person': client.contact_name || '',
    'Email': client.email,
    'Phone': client.phone || '',
    'Address': client.address || '',
  'Payment Terms': client.payment_terms,
  'Total Invoices': client.total_invoices || 0,
  'Total Revenue': client.total_amount || 0
  }));

  exportToCSV(data, 'clients');
}

// Export Expenses to CSV
export function exportExpensesToCSV(expenses: Expense[]): void {
  const data = expenses.map(expense => ({
  'Date': formatDate(expense.date_incurred ?? ''),
    'Description': expense.description,
  'Category': expense.category_name || 'Uncategorized',
    'Amount': expense.amount,
  'Payment Method': expense.payment_method,
  'Vendor': expense.vendor_name || '',
  'Receipt Number': expense.receipt_number || '',
  'Business Expense': expense.is_business_expense ? 'Yes' : 'No',
  'Tax Deductible': expense.tax_deductible ? 'Yes' : 'No',
    'Notes': expense.notes || ''
  }));

  exportToCSV(data, 'expenses');
}

// Generate Financial Report
export interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  topClients: { name: string; amount: number }[];
  topExpenseCategories: { category: string; amount: number }[];
  invoiceStats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

export function generateFinancialReport(
  invoices: Invoice[],
  expenses: Expense[],
  clients: Client[],
  startDate: Date,
  endDate: Date
): FinancialReport {
  // Filter data by date range
  const filteredInvoices = invoices.filter(inv => {
  const date = new Date(inv.issue_date ?? '');
    return date >= startDate && date <= endDate;
  });

  const filteredExpenses = expenses.filter(exp => {
  const date = new Date(exp.date_incurred ?? '');
    return date >= startDate && date <= endDate;
  });

  // Calculate revenue
  const revenue = filteredInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate expenses
  const totalExpenses = filteredExpenses
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate profit metrics
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Calculate top clients
  const clientRevenueMap = new Map<string, number>();
  filteredInvoices
    .filter(inv => inv.status === 'Paid')
    .forEach(inv => {
  const client = clients.find(c => c.id === inv.client_id);
      if (client) {
        clientRevenueMap.set(
          client.name,
          (clientRevenueMap.get(client.name) || 0) + inv.amount
        );
      }
    });

  const topClients = Array.from(clientRevenueMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calculate top expense categories
  const categoryExpenseMap = new Map<string, number>();
  filteredExpenses.forEach(exp => {
  const category = exp.category_name || 'Uncategorized';
    categoryExpenseMap.set(
      category,
      (categoryExpenseMap.get(category) || 0) + exp.amount
    );
  });

  const topExpenseCategories = Array.from(categoryExpenseMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calculate invoice statistics
  const today = new Date();
  const invoiceStats = {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(inv => inv.status === 'Paid').length,
    pending: filteredInvoices.filter(inv => inv.status === 'Pending').length,
    overdue: filteredInvoices.filter(inv => {
  const dueDate = new Date(inv.due_date);
      return inv.status !== 'Paid' && dueDate < today;
    }).length
  };

  return {
    period: `${formatDate(startDate.toISOString())} - ${formatDate(endDate.toISOString())}`,
    revenue,
    expenses: totalExpenses,
    netProfit,
    profitMargin,
    topClients,
    topExpenseCategories,
    invoiceStats
  };
}

// Export Financial Report to PDF
export async function exportReportToPDF(report: FinancialReport): Promise<void> {
  // This would require a PDF library like jsPDF
  // For now, we'll export as formatted JSON
  const reportData = {
    'Financial Report': report.period,
    'Summary': {
      'Total Revenue': formatCurrency(report.revenue),
      'Total Expenses': formatCurrency(report.expenses),
      'Net Profit': formatCurrency(report.netProfit),
      'Profit Margin': `${report.profitMargin.toFixed(2)}%`
    },
    'Invoice Statistics': report.invoiceStats,
    'Top Clients': report.topClients.map(c => ({
      Name: c.name,
      Revenue: formatCurrency(c.amount)
    })),
    'Top Expense Categories': report.topExpenseCategories.map(e => ({
      Category: e.category,
      Amount: formatCurrency(e.amount)
    }))
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
    type: 'application/json' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Bulk Export
export interface ExportOptions {
  includeInvoices?: boolean;
  includeClients?: boolean;
  includeExpenses?: boolean;
  format?: 'csv' | 'json';
  dateRange?: { start: Date; end: Date };
}

export function bulkExport(
  data: {
    invoices?: Invoice[];
    clients?: Client[];
    expenses?: Expense[];
  },
  options: ExportOptions = {}
): void {
  const {
    includeInvoices = true,
    includeClients = true,
    includeExpenses = true,
    format = 'csv',
    dateRange
  } = options;

  if (format === 'csv') {
    if (includeInvoices && data.invoices) {
      let invoices = data.invoices;
      if (dateRange) {
        invoices = invoices.filter(inv => {
          const date = new Date(inv.issue_date ?? '');
          return date >= dateRange.start && date <= dateRange.end;
        });
      }
      exportInvoicesToCSV(invoices);
    }

    if (includeClients && data.clients) {
      exportClientsToCSV(data.clients);
    }

    if (includeExpenses && data.expenses) {
      let expenses = data.expenses;
      if (dateRange) {
        expenses = expenses.filter(exp => {
          const date = new Date(exp.date_incurred ?? '');
          return date >= dateRange.start && date <= dateRange.end;
        });
      }
      exportExpensesToCSV(expenses);
    }
  } else {
    // Export as JSON
    const exportData: any = {};
    
    if (includeInvoices && data.invoices) {
      exportData.invoices = dateRange 
        ? data.invoices.filter(inv => {
            const date = new Date(inv.issue_date ?? '');
            return date >= dateRange.start && date <= dateRange.end;
          })
        : data.invoices;
    }

    if (includeClients && data.clients) {
      exportData.clients = data.clients;
    }

    if (includeExpenses && data.expenses) {
      exportData.expenses = dateRange
        ? data.expenses.filter(exp => {
            const date = new Date(exp.date_incurred ?? '');
            return date >= dateRange.start && date <= dateRange.end;
          })
        : data.expenses;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}