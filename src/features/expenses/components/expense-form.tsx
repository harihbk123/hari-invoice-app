// src/features/expenses/components/expense-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  is_reimbursable?: boolean;
}

interface ExpenseFormProps {
  expense?: any;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface ExpenseCategory {
  id: string;
  name: string;
}

export function ExpenseForm({ expense, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const { toast } = useToast();

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    payment_method: expense?.payment_method || 'Cash',
    is_reimbursable: expense?.is_reimbursable || false,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      
      // If no categories exist, create default ones
      if (!data || data.length === 0) {
        const defaultCategories = [
          { name: 'Office Supplies' },
          { name: 'Travel' },
          { name: 'Meals' },
          { name: 'Software' },
          { name: 'Marketing' },
          { name: 'Utilities' },
          { name: 'Other' }
        ];

        const { data: insertedData, error: insertError } = await supabase
          .from('expense_categories')
          .insert(defaultCategories)
          .select();

        if (insertError) throw insertError;
        setCategories(insertedData || []);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set fallback categories
      setCategories([
        { id: '1', name: 'Office Supplies' },
        { id: '2', name: 'Travel' },
        { id: '3', name: 'Meals' },
        { id: '4', name: 'Software' },
        { id: '5', name: 'Marketing' },
        { id: '6', name: 'Utilities' },
        { id: '7', name: 'Other' }
      ]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ExpenseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: any = e.target.value;
    
    if (field === 'amount') {
      value = parseFloat(e.target.value) || 0;
    } else if (field === 'is_reimbursable') {
      value = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingCategories) {
    return <div className="p-8 text-center">Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expense ? 'Edit Expense' : 'Create New Expense'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <Input
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="What was this expense for?"
              disabled={isLoading}
            />
            <FormMessage>{errors.description}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Amount *</FormLabel>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              placeholder="0.00"
              disabled={isLoading}
            />
            <FormMessage>{errors.amount}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Category *</FormLabel>
            <select
              value={formData.category}
              onChange={handleInputChange('category')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <FormMessage>{errors.category}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Date *</FormLabel>
            <Input
              type="date"
              value={formData.date}
              onChange={handleInputChange('date')}
              disabled={isLoading}
            />
            <FormMessage>{errors.date}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <select
              value={formData.payment_method}
              onChange={handleInputChange('payment_method')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </FormItem>

          <FormItem>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_reimbursable"
                checked={formData.is_reimbursable}
                onChange={handleInputChange('is_reimbursable')}
                disabled={isLoading}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <FormLabel htmlFor="is_reimbursable" className="text-sm font-medium">
                This is a reimbursable expense
              </FormLabel>
            </div>
          </FormItem>

          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              {isLoading ? 
                (expense ? 'Updating...' : 'Creating...') : 
                (expense ? 'Update Expense' : 'Create Expense')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
