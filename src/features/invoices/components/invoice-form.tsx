// src/features/invoices/components/invoice-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoiceId?: string;
}

interface InvoiceFormData {
  client_id: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  description: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export function InvoiceForm({ mode, invoiceId }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    amount: 0,
    status: 'Draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadClients();
    if (mode === 'edit' && invoiceId) {
      loadInvoice();
    }
  }, [mode, invoiceId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoice = async () => {
    if (!invoiceId) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setFormData({
        client_id: data.client_id || '',
        amount: data.amount || 0,
        status: data.status || 'Draft',
        issue_date: data.issue_date || '',
        due_date: data.due_date || '',
        description: data.description || ''
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.issue_date) {
      newErrors.issue_date = 'Issue date is required';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InvoiceFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const { error } = await supabase
          .from('invoices')
          .insert([{
            ...formData,
            invoice_number: `INV-${Date.now()}`, // Simple invoice number generation
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Invoice created successfully',
        });
      } else {
        const { error } = await supabase
          .from('invoices')
          .update(formData)
          .eq('id', invoiceId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Invoice updated successfully',
        });
      }

      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: mode === 'create' ? 'Failed to create invoice' : 'Failed to update invoice',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormItem>
            <FormLabel>Client *</FormLabel>
            <select
              value={formData.client_id}
              onChange={handleInputChange('client_id')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <FormMessage>{errors.client_id}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Amount *</FormLabel>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            <FormMessage>{errors.amount}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Status</FormLabel>
            <select
              value={formData.status}
              onChange={handleInputChange('status')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Issue Date *</FormLabel>
              <Input
                type="date"
                value={formData.issue_date}
                onChange={handleInputChange('issue_date')}
                disabled={isSubmitting}
              />
              <FormMessage>{errors.issue_date}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <Input
                type="date"
                value={formData.due_date}
                onChange={handleInputChange('due_date')}
                disabled={isSubmitting}
              />
              <FormMessage>{errors.due_date}</FormMessage>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Description</FormLabel>
            <Input
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Invoice description"
              disabled={isSubmitting}
            />
          </FormItem>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/invoices')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 
                (mode === 'create' ? 'Creating...' : 'Updating...') : 
                (mode === 'create' ? 'Create Invoice' : 'Update Invoice')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
