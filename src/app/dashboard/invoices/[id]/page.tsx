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
import { useClients } from '@/features/clients/hooks/use-clients';
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
  const { clients } = useClients();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);

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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete invoice.',
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
      setShowStatusDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update invoice status.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    try {
      const client = clients.find(c => c.id === invoice.client_id) || {
        id: invoice.client_id || '',
        name: invoice.clients?.name || invoice.client_name || 'Unknown Client',
        email: invoice.clients?.email || invoice.client_email || '',
        phone: invoice.clients?.phone || invoice.client_phone || '',
        address: invoice.clients?.address || invoice.client_address || '',
        company: invoice.clients?.company || invoice.client_company || '',
      };
      
      if (settings) {
        downloadInvoicePDF(invoice, client, settings);
        toast({
          title: 'Success',
          description: `PDF for invoice ${invoice.invoice_number} downloaded successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Settings not loaded. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF.',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
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
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Change Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Invoice Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status: <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStatusChange}
                    disabled={!newStatus || isChangingStatus}
                    className="flex-1"
                  >
                    {isChangingStatus ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowStatusDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Invoice Number</label>
                  <p className="font-semibold">{invoice.invoice_number || invoice.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status || 'Draft'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issue Date</label>
                  <p className="font-semibold">{formatDate(invoice.issue_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="font-semibold">{invoice.description || 'No description'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                    invoice.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.description || 'No description'}</TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell>{formatCurrency(item.rate || 0)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                {invoice.tax && invoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.amount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold">
                    {invoice.clients?.name || invoice.client_name || 'Unknown Client'}
                  </p>
                </div>
                {(invoice.clients?.email || invoice.client_email) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="font-semibold">
                      {invoice.clients?.email || invoice.client_email}
                    </p>
                  </div>
                )}
                {(invoice.clients?.company || invoice.client_company) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="font-semibold">
                      {invoice.clients?.company || invoice.client_company}
                    </p>
                  </div>
                )}
                {(invoice.clients?.phone || invoice.client_phone) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="font-semibold">
                      {invoice.clients?.phone || invoice.client_phone}
                    </p>
                  </div>
                )}
                {(invoice.clients?.address || invoice.client_address) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="font-semibold">
                      {invoice.clients?.address || invoice.client_address}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount Due</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(invoice.amount || 0)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status || 'Draft'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="font-semibold flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleDownloadPDF} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Link href={`/dashboard/invoices/${invoiceId}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Invoice
                </Button>
              </Link>
              <Button 
                onClick={() => setShowStatusDialog(true)} 
                className="w-full" 
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Change Status
              </Button>
              <Button 
                onClick={handleDelete} 
                className="w-full" 
                variant="destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
