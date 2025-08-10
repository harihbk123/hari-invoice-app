// src/utils/format.ts
import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency value to Indian Rupees
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₹0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `₹${numAmount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Format number with Indian numbering system
 */
export function formatNumber(
  value: number | string,
  locale: string = 'en-IN'
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }

  return numValue.toLocaleString(locale);
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: string | Date,
  formatString: string = 'PP'
): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 7) {
      return formatDate(dateObj, 'MMM d, yyyy');
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  if (isNaN(value)) {
    return '0.0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number for Indian numbers
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian mobile numbers are 10 digits
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Indian landline with STD code
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  
  // International format
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return phone; // Return as-is if doesn't match expected patterns
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format invoice number with prefix
 */
export function formatInvoiceNumber(number: number | string, prefix: string = 'INV'): string {
  const numStr = typeof number === 'number' ? number.toString() : number;
  const paddedNum = numStr.padStart(4, '0');
  return `${prefix}-${paddedNum}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols, spaces, and commas
  const cleaned = currencyString.replace(/[₹$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format business hours
 */
export function formatBusinessHours(startTime: string, endTime: string): string {
  try {
    const start = format(parseISO(`2000-01-01T${startTime}`), 'h:mm a');
    const end = format(parseISO(`2000-01-01T${endTime}`), 'h:mm a');
    return `${start} - ${end}`;
  } catch (error) {
    return `${startTime} - ${endTime}`;
  }
}
