'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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

export default function CreateInvoicePage() {
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
  }, []);

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
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
        .insert([{
          ...formData,
          invoice_number: `INV-${Date.now()}`, // Simple invoice number generation
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
      
      router.push('/dashboard/invoices');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your client</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <select
                  value={formData.client_id}
                  onChange={handleInputChange('client_id')}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
                <FormMessage>{errors.client_id}</FormMessage>
              </FormItem>

              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange('amount')}
                    disabled={isSubmitting}
                  />
                  <FormMessage>{errors.amount}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <select
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </FormItem>
              </div>

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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/invoices')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
