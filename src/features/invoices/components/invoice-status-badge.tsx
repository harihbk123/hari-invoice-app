// src/features/invoices/components/invoice-status-badge.tsx
import { Badge } from '@/components/ui/badge';

interface InvoiceStatusBadgeProps {
  status: string;
}
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getVariant = (status: string): BadgeVariant => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'paid':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'overdue':
        return 'overdue';
      case 'draft':
        return 'draft';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {status}
    </Badge>
  );
}
