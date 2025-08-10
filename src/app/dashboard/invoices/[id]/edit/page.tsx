'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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

// Fix: Allow undefined in errors object
interface FormErrors {
  [key: string]: string | undefined;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    amount: 0,
    status: 'Draft',
    issue_date: '',
    due_date: '',
    description: ''
  });

  // Fix: Use FormErrors type that allows undefined
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadClients();
    loadInvoice();
  }, [invoiceId]);

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
    }
  };

  const loadInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setInvoice(data);
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
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
    return Object.keys(newErrors).filter(key => newErrors[key] !== undefined).length === 0;
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
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
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
      const { error } = await supabase
        .from('invoices')
        .update(formData)
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice updated successfully',
      });

      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invoice Not Found</h1>
          <p className="text-gray-600 mt-2">The invoice you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Invoice</h1>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
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
                {errors.client_id && <FormMessage>{errors.client_id}</FormMessage>}
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
                {errors.amount && <FormMessage>{errors.amount}</FormMessage>}
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
                  {errors.issue_date && <FormMessage>{errors.issue_date}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={handleInputChange('due_date')}
                    disabled={isSubmitting}
                  />
                  {errors.due_date && <FormMessage>{errors.due_date}</FormMessage>}
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
                  {isSubmitting ? 'Updating...' : 'Update Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
