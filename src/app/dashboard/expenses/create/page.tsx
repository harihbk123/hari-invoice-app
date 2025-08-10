'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import { useCreateExpense } from '@/features/expenses/hooks/use-expenses';
import type { ExpenseFormData } from '@/types/expense';

export default function CreateExpensePage() {
  const router = useRouter();
  const createExpense = useCreateExpense();

  const handleSubmit = async (data: ExpenseFormData) => {
    await createExpense.mutateAsync(data);
    router.push('/dashboard/expenses');
  };

  const handleCancel = () => {
    router.push('/dashboard/expenses');
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Create Expense</h1>
          <p className="text-muted-foreground">Add a new business expense</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createExpense.isPending}
        />
      </div>
    </div>
  );
}
