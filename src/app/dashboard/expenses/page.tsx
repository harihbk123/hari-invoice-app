'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, DollarSign, Calendar, Receipt, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExpenses, useDeleteExpense } from '@/features/expenses/hooks/use-expenses';
import { formatCurrency, formatDate } from '@/utils/format';

export default function ExpensesPage() {
  const { expenses, isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);
  
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending').length;
  const reimbursableExpenses = expenses.filter(expense => expense.is_reimbursable).reduce((sum, expense) => sum + expense.amount, 0);

  // Get unique categories for filter
  const categories = [...new Set(expenses.map(expense => expense.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingExpenses}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(reimbursableExpenses)}</p>
                <p className="text-xs text-muted-foreground">Reimbursable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No expenses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your business expenses
              </p>
              <Button asChild>
                <Link href="/dashboard/expenses/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Expense
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{expense.description}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{expense.category}</span>
                      <span>{formatDate(expense.date)}</span>
                      {expense.is_reimbursable && (
                        <span className="text-green-600">Reimbursable</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
