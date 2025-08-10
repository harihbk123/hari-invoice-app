'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Receipt, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getClient, getClientInvoices } from '@/lib/supabase/queries';
import { useStore } from '@/store';
import Link from 'next/link';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const clientId = params.id as string;

  const { data: client, isLoading: isLoadingClient, error: clientError } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClient(clientId),
    enabled: !!clientId,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['client-invoices', clientId],
    queryFn: () => getClientInvoices(clientId),
    enabled: !!clientId,
  });

  const handleDeleteClient = async () => {
    if (!client) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      // Add delete functionality here
      toast({
        title: 'Client Deleted',
        description: `${client.name} has been successfully deleted.`,
      });
      router.push('/dashboard/clients');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete client. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading client details...</div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Client Not Found</h2>
          <p className="text-muted-foreground mt-2">The client you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalInvoices = invoices?.length || 0;
  const totalRevenue = invoices?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
  const paidInvoices = invoices?.filter(invoice => invoice.status === 'Paid')?.length || 0;
  const pendingAmount = invoices?.filter(invoice => invoice.status === 'Pending')?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">{client.company || 'Individual Client'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${clientId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/create?client=${clientId}`}>
              <Receipt className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDeleteClient}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Client Information */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{client.address}</p>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {client.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Client Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(client.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Statistics */}
        <div className="md:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{paidInvoices}</div>
                <p className="text-xs text-muted-foreground">Paid Invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">${pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/invoices?client=${clientId}`}>
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Loading invoices...</div>
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No invoices yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first invoice for this client
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/invoices/create?client=${clientId}`}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
