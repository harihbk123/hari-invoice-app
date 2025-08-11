import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice, InvoiceFormData } from '@/types';
import { 
  getInvoices, 
  getInvoice, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice,
  changeInvoiceStatus,
  getNextInvoiceNumber
} from '@/lib/supabase/queries';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store';

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setInvoices = useStore((state) => state.setInvoices);

  const query = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const data = await getInvoices();
      const safeData = data.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number || '',
        client_id: invoice.client_id || '',
        amount: invoice.amount ?? 0,
        status: invoice.status || 'Draft',
        issue_date: invoice.issue_date || '',
        due_date: invoice.due_date || '',
        description: invoice.description || '',
        subtotal: invoice.subtotal ?? 0,
        tax: invoice.tax ?? 0,
        items: invoice.items || [],
        client: invoice.client || undefined,
        client_name: invoice.client_name || '',
        client_email: invoice.client_email || '',
        client_phone: invoice.client_phone || '',
        client_address: invoice.client_address || '',
        client_company: invoice.client_company || '',
        created_at: invoice.created_at || '',
        updated_at: invoice.updated_at || '',
      }));
      // Add required fields for store type
      const storeData = safeData.map(inv => ({
        ...inv,
        client_id: inv.client_id || null,
        client_name: inv.client_name || '',
        amount: inv.amount ?? 0,
        subtotal: inv.subtotal ?? 0,
        tax: inv.tax ?? 0,
        date_issued: inv.issue_date || '',
        due_date: inv.due_date || '',
        status: inv.status || null,
        items: (inv.items as any) || [],
        created_at: inv.created_at || null,
        updated_at: inv.updated_at || null,
      }));
      setInvoices(storeData);
      return storeData;
    },
  });

  return {
    invoices: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addInvoice = useStore((state) => state.addInvoice);

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      addInvoice({
        ...data,
        client_id: data.client_id || null,
        client_name: data.client_name || '',
        amount: data.amount ?? 0,
        subtotal: data.subtotal ?? 0,
        tax: data.tax ?? 0,
        date_issued: data.issue_date || '',
        due_date: data.due_date || '',
        status: data.status || null,
        items: (data.items as any) || [],
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: `Invoice ${data.id} created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateInvoice() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateInvoiceInStore = useStore((state) => state.updateInvoice);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceFormData }) =>
      updateInvoice(id, data),
    onSuccess: (data) => {
      updateInvoiceInStore(data.id, {
        ...data,
        client_id: data.client_id || null,
        client_name: data.client_name || '',
        amount: data.amount ?? 0,
        subtotal: data.subtotal ?? 0,
        tax: data.tax ?? 0,
        date_issued: data.issue_date || '',
        due_date: data.due_date || '',
        status: data.status || null,
        items: (data.items as any) || [],
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: 'Invoice updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update invoice',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteInvoice() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const removeInvoice = useStore((state) => state.removeInvoice);

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (_, id) => {
      removeInvoice(id);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete invoice',
        variant: 'destructive',
      });
    },
  });
}

export function useChangeInvoiceStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
  changeInvoiceStatus(id, status as 'Paid' | 'Pending' | 'Draft' | 'Overdue' | 'Cancelled'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: `Invoice status changed to ${data.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change invoice status',
        variant: 'destructive',
      });
    },
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ['nextInvoiceNumber'],
    queryFn: getNextInvoiceNumber,
  });
}