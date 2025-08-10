// src/app/dashboard/invoices/page.tsx
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
import { InvoiceStatusBadge } from '@/features/invoices/components/invoice-status-badge';
import { useInvoices, useDeleteInvoice, useChangeInvoiceStatus } from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Edit, Trash2, Download, Filter } from 'lucide-react';
import { downloadInvoicePDF } from '@/features/invoices/lib/pdf-generator';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useClients } from '@/features/clients/hooks/use-clients';

export default function InvoicesPage() {
  const { invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const changeStatus = useChangeInvoiceStatus();
  const { settings } = useSettings();
  const { clients } = useClients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = invoices.filter((invoice) => {
    // Fix: Handle both nested and flat client data structures
    const clientName = invoice.clients?.name || invoice.client_name || '';
    const invoiceNumber = invoice.invoice_number || invoice.id || '';
    
    const matchesSearch =
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await changeStatus.mutateAsync({ id, status: newStatus as any });
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleDownloadPDF = async (invoice: any) => {
    if (!settings) {
      console.error('Settings not loaded');
      return;
    }

    try {
      // Get client info - handle both nested and flat structures
      const client = invoice.clients || {
        name: invoice.client_name || 'Unknown Client',
        email: invoice.client_email || '',
        address: invoice.client_address || ''
      };

      await downloadInvoicePDF(invoice, client, settings);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-lg">
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
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                // Handle both nested and flat client data
                const clientName = invoice.clients?.name || invoice.client_name || 'Unknown Client';
                const invoiceNumber = invoice.invoice_number || invoice.id;
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell>
                      {invoice.issue_date ? formatDate(invoice.issue_date) : '-'}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredInvoices.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
          <span>
            Total: {formatCurrency(
              filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
}
