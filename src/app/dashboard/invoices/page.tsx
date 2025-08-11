'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InvoiceStatusBadge } from '@/features/invoices/components/invoice-status-badge';
import { useInvoices, useDeleteInvoice, useChangeInvoiceStatus } from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Edit, Trash2, Download, Filter } from 'lucide-react';
import { downloadInvoicePDF } from '@/features/invoices/lib/pdf-generator';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const { invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const changeStatus = useChangeInvoiceStatus();
  const { settings } = useSettings();
  const { clients } = useClients();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{ open: boolean; invoiceId: string; currentStatus: string }>({
    open: false,
    invoiceId: '',
    currentStatus: ''
  });
  const [newStatus, setNewStatus] = useState('');

  const filteredInvoices = invoices.filter((invoice) => {
    // Handle both nested and flat client data structures
    const clientName = invoice.client?.name || invoice.client_name || '';
    const invoiceNumber = invoice.invoice_number || invoice.id || '';
    
    const matchesSearch =
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteInvoice.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete invoice',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await changeStatus.mutateAsync({ id, status: newStatus });
      setStatusChangeDialog({ open: false, invoiceId: '', currentStatus: '' });
      setNewStatus('');
      toast({
        title: 'Success',
        description: `Invoice status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change invoice status',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = (invoice: any) => {
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
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const openStatusDialog = (invoice: any) => {
    setStatusChangeDialog({
      open: true,
      invoiceId: invoice.id,
      currentStatus: invoice.status || 'Draft'
    });
    setNewStatus(invoice.status || 'Draft');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        <Link href="/dashboard/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {invoice.client?.name || invoice.client_name || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.client?.email || invoice.client_email || ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(invoice.amount || 0)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(invoice)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(invoice)}
                    >
                      Status
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
                      disabled={isDeleting === invoice.id}
                    >
                      {isDeleting === invoice.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No invoices found matching your criteria.'
                : 'No invoices yet. Create your first invoice to get started.'
              }
            </div>
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog 
        open={statusChangeDialog.open} 
        onOpenChange={(open) => setStatusChangeDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: <span className="font-semibold">{statusChangeDialog.currentStatus}</span>
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
                onClick={() => handleStatusChange(statusChangeDialog.invoiceId, newStatus)}
                disabled={!newStatus || changeStatus.isPending}
                className="flex-1"
              >
                {changeStatus.isPending ? 'Updating...' : 'Update Status'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStatusChangeDialog({ open: false, invoiceId: '', currentStatus: '' })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
