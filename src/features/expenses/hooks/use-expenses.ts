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
      setExpenses(data);
      return data;
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
      addExpense(data);
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
