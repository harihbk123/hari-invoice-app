import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseFormData } from '@/types/expense';
import { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '@/lib/supabase/queries';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store';

export function useExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setExpenses = useStore((state) => state.setExpenses);

  const query = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const data = await getExpenses();
      const safeData = data.map(expense => ({
        id: expense.id,
        description: expense.description || '',
        amount: expense.amount ?? 0,
        category: expense.category || '',
        category_id: expense.category_id || '',
        category_name: expense.category_name || '',
        date: expense.date || '',
        date_incurred: expense.date_incurred || '',
        payment_method: expense.payment_method || '',
        vendor_name: expense.vendor_name || '',
        receipt_number: expense.receipt_number || '',
        receipt_url: expense.receipt_url || '',
        is_business_expense: expense.is_business_expense ?? false,
        is_reimbursable: expense.is_reimbursable ?? false,
        tax_deductible: expense.tax_deductible ?? false,
        notes: expense.notes || '',
        tags: expense.tags || [],
        status: expense.status || 'pending',
        created_at: expense.created_at || '',
        updated_at: expense.updated_at || '',
      }));
      setExpenses(safeData);
      return safeData;
    },
  });

  return {
    expenses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addExpense = useStore((state) => state.addExpense);

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (data) => {
      addExpense({
        ...data,
        category_id: data.category_id || '',
        category_name: data.category_name || '',
        date_incurred: data.date_incurred || '',
        payment_method: data.payment_method || '',
        vendor_name: data.vendor_name || '',
        receipt_number: data.receipt_number || '',
  is_business_expense: data.is_business_expense ?? false,
  tax_deductible: data.tax_deductible ?? false,
  notes: data.notes || '',
  tags: data.tags || [],
  created_at: data.created_at || '',
  updated_at: data.updated_at || '',
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: 'Expense created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create expense',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateExpenseInStore = useStore((state) => state.updateExpense);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseFormData }) =>
      updateExpense(id, data),
    onSuccess: (data) => {
      updateExpenseInStore(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', data.id] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: 'Expense updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update expense',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const removeExpense = useStore((state) => state.removeExpense);

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_, id) => {
      removeExpense(id);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete expense',
        variant: 'destructive',
      });
    },
  });
}
