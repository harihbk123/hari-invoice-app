'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/types/expense';

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  is_reimbursable: boolean;
}

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

export function ExpenseForm({ expense, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    payment_method: expense?.payment_method || '',
    is_reimbursable: expense?.is_reimbursable || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ExpenseFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : 
                  field === 'is_reimbursable' ? e.target.checked :
                  e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: expense ? 'Expense updated successfully' : 'Expense created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? 'Edit Expense' : 'Create New Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormItem>
            <FormLabel>Description</FormLabel>
            <Input
              placeholder="Enter expense description"
              disabled={isLoading}
              value={formData.description}
              onChange={handleInputChange('description')}
            />
            <FormMessage>{errors.description}</FormMessage>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isLoading}
                value={formData.amount}
                onChange={handleInputChange('amount')}
              />
              <FormMessage>{errors.amount}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                disabled={isLoading}
                value={formData.date}
                onChange={handleInputChange('date')}
              />
              <FormMessage>{errors.date}</FormMessage>
            </FormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Input
                placeholder="e.g., Office Supplies, Travel"
                disabled={isLoading}
                value={formData.category}
                onChange={handleInputChange('category')}
              />
              <FormMessage>{errors.category}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Input
                placeholder="e.g., Credit Card, Cash"
                disabled={isLoading}
                value={formData.payment_method}
                onChange={handleInputChange('payment_method')}
              />
            </FormItem>
          </div>

          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <input
              type="checkbox"
              checked={formData.is_reimbursable}
              onChange={handleInputChange('is_reimbursable')}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <FormLabel className="text-sm font-normal">
              This expense is reimbursable
            </FormLabel>
          </FormItem>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : expense ? 'Update Expense' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
