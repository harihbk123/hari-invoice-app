'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
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

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

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

  const handleInputChange = (field: keyof InvoiceFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The invoice you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
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
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
          <p className="text-muted-foreground">Update invoice details</p>
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
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange('amount')}
                    disabled={isSubmitting}
                  />
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
                    <option value="Overdue">Overdue</option>
                  </select>
                </FormItem>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.issue_date}
                    onChange={handleInputChange('issue_date')}
                    disabled={isSubmitting}
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={handleInputChange('due_date')}
                    disabled={isSubmitting}
                  />
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
