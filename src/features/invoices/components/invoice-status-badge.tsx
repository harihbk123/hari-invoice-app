import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, Minus } from 'lucide-react';

interface InvoiceStatusBadgeProps {
  status: string | null | undefined;
  showIcon?: boolean;
}

export function InvoiceStatusBadge({ status, showIcon = true }: InvoiceStatusBadgeProps) {
  const getStatusVariant = (status: string | null | undefined) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      case 'draft':
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    if (!showIcon) return null;
    const normalizedStatus = status?.toLowerCase();
    const iconClass = "w-3 h-3 mr-1";
    switch (normalizedStatus) {
      case 'paid':
        return <CheckCircle className={iconClass} />;
      case 'pending':
        return <Clock className={iconClass} />;
      case 'overdue':
        return <AlertCircle className={iconClass} />;
      case 'cancelled':
        return <XCircle className={iconClass} />;
      case 'draft':
      default:
        return <Minus className={iconClass} />;
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const displayStatus = status || 'Draft';
  const statusText = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1).toLowerCase();

  return (
    <Badge 
      variant={getStatusVariant(status)} 
      className={`inline-flex items-center ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      {statusText}
    </Badge>
  );
}
