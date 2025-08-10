'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Invoice } from '@/types/invoice';
import { Client } from '@/types/client';
import { Expense } from '@/types/expense';
import MonthlyRevenueChart from '@/components/charts/MonthlyRevenueChart';
import ClientDistributionChart from '@/components/charts/ClientDistributionChart';
import InvoiceStatusChart from '@/components/charts/InvoiceStatusChart';
import ExpenseCategoryChart from '@/components/charts/ExpenseCategoryChart';
import BalanceCards from '@/components/expenses/BalanceCards';
import { formatCurrency, formatDate } from '@/utils/format';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalClients: number;
  activeClients: number;
  totalInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  monthlyGrowth: number;
  recentActivity: Activity[];
}

interface Activity {
  id: string;
  type: 'invoice' | 'payment' | 'expense' | 'client';
  description: string;
  amount?: number;
  timestamp: string;
  status?: string;
}

interface ChartData {
  monthlyRevenue: any[];
  clientDistribution: any[];
  invoiceStatus: any[];
  expenseCategories: any[];
}

export default function EnhancedDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalClients: 0,
    activeClients: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    averageInvoiceValue: 0,
    monthlyGrowth: 0,
    recentActivity: []
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    monthlyRevenue: [],
    clientDistribution: [],
    invoiceStatus: [],
    expenseCategories: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [invoicesResult, clientsResult, expensesResult] = await Promise.all([
        supabase.from('invoices').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('expenses').select('*')
      ]);

      const invoices = invoicesResult.data || [];
      const clients = clientsResult.data || [];
      const expenses = expensesResult.data || [];

      // Calculate metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
      const overdueInvoices = invoices.filter(inv => {
        return inv.status === 'Pending' && new Date(inv.due_date) < new Date();
      }).length;
      
      const averageInvoiceValue = invoices.length > 0 
        ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length 
        : 0;

      // Set metrics
      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        totalInvoices: invoices.length,
        pendingInvoices,
        overdueInvoices,
        averageInvoiceValue,
        monthlyGrowth: 12.5, // This would be calculated based on historical data
        recentActivity: [] // This would be loaded from activity logs
      });

      // Prepare chart data
      setChartData({
        monthlyRevenue: [], // Process monthly revenue data
        clientDistribution: [], // Process client distribution
        invoiceStatus: [
          { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
          { name: 'Pending', value: pendingInvoices },
          { name: 'Overdue', value: overdueInvoices }
        ],
        expenseCategories: [] // Process expense categories
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/invoices/create"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Link>
          <Link 
            href="/dashboard/expenses/create"
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpIcon className="h-4 w-4" />
              {metrics.monthlyGrowth.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mt-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mt-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(metrics.totalExpenses)}
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${
              metrics.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <ArrowTrendingUpIcon className={`h-6 w-6 ${
                metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <span className={`text-sm flex items-center gap-1 ${
              metrics.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.profitMargin.toFixed(1)}% margin
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
          <p className={`text-2xl font-bold mt-1 ${
            metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(metrics.netProfit)}
          </p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mt-2">Active Clients</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {metrics.activeClients}
          </p>
          <p className="text-sm text-gray-500">
            of {metrics.totalClients} total
          </p>
        </div>
      </div>

      {/* Balance Overview */}
      <BalanceCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <Link href="/dashboard/analytics" className="text-sm text-primary hover:underline">
              View Details →
            </Link>
          </div>
          <MonthlyRevenueChart data={chartData.monthlyRevenue} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invoice Status</h3>
            <Link href="/dashboard/invoices" className="text-sm text-primary hover:underline">
              Manage →
            </Link>
          </div>
          <InvoiceStatusChart data={chartData.invoiceStatus} />
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Invoices Alert */}
        {metrics.pendingInvoices > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Pending Invoices</h4>
                <p className="text-sm text-yellow-700">
                  {metrics.pendingInvoices} invoice{metrics.pendingInvoices !== 1 ? 's' : ''} awaiting payment
                </p>
                <Link href="/dashboard/invoices?filter=pending" className="text-xs text-yellow-600 hover:underline">
                  View pending invoices →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Invoices Alert */}
        {metrics.overdueInvoices > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Overdue Invoices</h4>
                <p className="text-sm text-red-700">
                  {metrics.overdueInvoices} invoice{metrics.overdueInvoices !== 1 ? 's' : ''} past due
                </p>
                <Link href="/dashboard/invoices?filter=overdue" className="text-xs text-red-600 hover:underline">
                  View overdue invoices →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
