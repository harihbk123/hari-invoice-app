'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import { useExpense, useUpdateExpense } from '@/features/expenses/hooks/use-expenses';
import type { ExpenseFormData } from '@/types/expense';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const expenseId = params?.id ? String(params.id) : '';

  const { data: expense, isLoading, error } = useExpense(expenseId);
  const updateExpense = useUpdateExpense();

  const handleSubmit = async (data: ExpenseFormData) => {
    await updateExpense.mutateAsync({ id: expenseId, data });
    router.push('/dashboard/expenses');
  };

  const handleCancel = () => {
    router.push('/dashboard/expenses');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading expense...</div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expense Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The expense you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/dashboard/expenses">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Expenses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/expenses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Expenses
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-muted-foreground">Update expense details</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ExpenseForm
          expense={expense}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateExpense.isPending}
        />
      </div>
    </div>
  );
}
