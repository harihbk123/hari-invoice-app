// src/lib/error-handler.ts
import { useToast } from '@/hooks/use-toast';

export interface AppError extends Error {
  code?: string;
  details?: any;
  statusCode?: number;
}

export class InvoiceError extends Error implements AppError {
  code: string;
  details?: any;
  statusCode?: number;

  constructor(message: string, code: string = 'INVOICE_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'InvoiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends InvoiceError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends InvoiceError {
  constructor(message: string = 'Network error occurred', details?: any) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class AuthError extends InvoiceError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends InvoiceError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// Error parsing utility
export function parseSupabaseError(error: any): AppError {
  if (!error) return new InvoiceError('Unknown error occurred');

  // Handle Supabase specific errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return new NotFoundError();
      case '23505':
        return new ValidationError('Duplicate entry found', error);
      case '23503':
        return new ValidationError('Referenced record not found', error);
      case '42501':
        return new AuthError('Insufficient permissions');
      default:
        return new InvoiceError(error.message || 'Database error', error.code, 500, error);
    }
  }

  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new NetworkError('Failed to connect to server');
  }

  // Handle general errors
  if (error instanceof Error) {
    return new InvoiceError(error.message, 'GENERAL_ERROR');
  }

  return new InvoiceError('Unknown error occurred');
}

// Error message formatter
export function getErrorMessage(error: any): string {
  // AppError is a type, not a value. Use InvoiceError or check for code property.
  if (error instanceof InvoiceError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// User-friendly error messages
export function getUserFriendlyMessage(error: any): string {
  const appError = error instanceof InvoiceError ? error : parseSupabaseError(error);

  switch (appError.code) {
    case 'NOT_FOUND':
      return 'The requested item could not be found.';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.';
    case 'AUTH_ERROR':
      return 'You need to be logged in to perform this action.';
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again.';
    case 'INVOICE_ERROR':
      return appError.message || 'An error occurred while processing your request.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// React hook for error handling
export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: any, customMessage?: string) => {
    console.error('Error caught:', error);
    
    const message = customMessage || getUserFriendlyMessage(error);
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const handleSuccess = (message: string, description?: string) => {
    toast({
      title: 'Success',
      description: description || message,
    });
  };

  return { handleError, handleSuccess };
}

// Retry utility for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw parseSupabaseError(error);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw parseSupabaseError(lastError);
}

// Validation utilities
export function validateInvoiceData(data: any): ValidationError | null {
  const errors: string[] = [];

  if (!data.client_id && !data.client_name) {
    errors.push('Client is required');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!data.issue_date) {
    errors.push('Issue date is required');
  }

  if (!data.due_date) {
    errors.push('Due date is required');
  }

  if (data.due_date && data.issue_date && new Date(data.due_date) < new Date(data.issue_date)) {
    errors.push('Due date must be after issue date');
  }

  if (errors.length > 0) {
    return new ValidationError(errors.join(', '));
  }

  return null;
}

export function validateClientData(data: any): ValidationError | null {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Client name is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (errors.length > 0) {
    return new ValidationError(errors.join(', '));
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Async error boundary
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw parseSupabaseError(error);
    }
  };
}
