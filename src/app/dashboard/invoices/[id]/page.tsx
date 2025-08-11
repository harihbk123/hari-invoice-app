'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useInvoice, useDeleteInvoice, useChangeInvoiceStatus } from '@/features/invoices/hooks/use-invoices';
import { downloadInvoicePDF } from '@/features/invoices/lib/pdf-generator';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, Edit, Trash2, Download, Mail, 
  Eye, Calendar, DollarSign, User, FileText 
} from 'lucide-react';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceId = params?.id ? String(params.id) : '';
  
  // Fix: useInvoice returns { data, isLoading, error } from React Query
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const deleteInvoice = useDeleteInvoice();
  const changeStatus = useChangeInvoiceStatus();
  const { settings } = useSettings();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInvoice.mutateAsync(invoiceId);
      toast({
        title: 'Invoice Deleted',
        description: 'Invoice has been deleted successfully.',
      });
      router.push('/dashboard/invoices');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;

    setIsChangingStatus(true);
    try {
      await changeStatus.mutateAsync({ id: invoiceId, status: newStatus as any });
      toast({
        title: 'Status Updated',
        description: 'Invoice status has been updated successfully.',
      });
      setNewStatus('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice status.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !settings) return;
    
    try {
      // Get client data for PDF - handle both nested and flattened structures
      const client = invoice.client || {
        id: invoice.client_id,
        name: invoice.client_name || 'Unknown Client',
        email: invoice.client_email || '',
        phone: invoice.client_phone || '',
        address: invoice.client_address || '',
        company: invoice.client_company || ''
      };
      
      await downloadInvoicePDF(invoice, client, settings);
      toast({
        title: 'PDF Downloaded',
        description: 'Invoice PDF has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF.',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invoice Not Found</h1>
          <p className="text-gray-600 mt-2">The invoice you're looking for doesn't exist.</p>
          <Link href="/dashboard/invoices">
            <Button className="mt-4">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number || invoice.id}</h1>
            <p className="text-gray-600">View and manage invoice details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            onClick={handleDelete} 
            variant="destructive"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoice Status</CardTitle>
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStatusChange}
                  disabled={!newStatus || isChangingStatus}
                >
                  {isChangingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-semibold">{invoice.invoice_number || invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(invoice.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-semibold">{formatDate(invoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                </div>
              </div>
              {invoice.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-semibold">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Client Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">
                  {invoice.client?.name || invoice.client_name || 'Unknown Client'}
                </p>
              </div>
              {(invoice.client?.email || invoice.client_email) && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{invoice.client?.email || invoice.client_email}</p>
                </div>
              )}
              {(invoice.client?.phone || invoice.client_phone) && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{invoice.client?.phone || invoice.client_phone}</p>
                </div>
              )}
              {(invoice.client?.address || invoice.client_address) && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold whitespace-pre-line">
                    {invoice.client?.address || invoice.client_address}
                  </p>
                </div>
              )}
              {(invoice.client?.company || invoice.client_company) && (
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">
                    {invoice.client?.company || invoice.client_company}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal || invoice.amount)}</span>
              </div>
              {invoice.tax && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
