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
      await deleteInvoice.mutateAsync(id);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await changeStatus.mutateAsync({ id, status: newStatus });
  };

  const handleDownloadPDF = (invoice: any) => {
    const client = clients.find(c => c.id === invoice.client_id) || {
      id: invoice.client_id,
      name: invoice.clients?.name || invoice.client_name || 'Unknown Client',
      email: invoice.clients?.email || '',
      phone: invoice.clients?.phone || '',
      address: invoice.clients?.address || '',
    };
    
    if (settings) {
      downloadInvoicePDF(invoice, client, settings);
    }
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
                      {formatDate(invoice.issue_date)}
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-700"
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
    </div>
  );
}
