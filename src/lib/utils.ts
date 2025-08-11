// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date - Now handles undefined values
export function formatDate(date: string | Date | undefined | null, format: 'short' | 'long' | 'medium' = 'medium'): string {
  if (!date) return '-';
  try {
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
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

// Format number
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format percentage
export function formatPercentage(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

// Get due date from terms (e.g., "Net 30" = 30 days from now)
export function getDueDateFromTerms(terms: string, issueDate: Date = new Date()): Date {
  const match = terms.match(/(\d+)/);
  const days = match ? parseInt(match[1]) : 30;
  
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + days);
  
  return dueDate;
}

// Slugify text for URLs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

// Generate random color
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
