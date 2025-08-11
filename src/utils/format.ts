// src/utils/format.ts

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'medium' = 'medium'): string {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  let options: Intl.DateTimeFormatOptions;
  switch (format) {
    case 'short':
      options = { year: 'numeric', month: 'short', day: 'numeric' };
      break;
    case 'long':
      options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      break;
    case 'medium':
    default:
      options = { year: 'numeric', month: 'long', day: 'numeric' };
      break;
  }
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}
