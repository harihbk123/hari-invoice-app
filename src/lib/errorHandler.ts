// src/lib/errorHandler.ts
import { toast } from 'react-hot-toast'

export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, any>
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', statusCode || 500, context)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, context)
    this.name = 'AuthorizationError'
  }
}

// Error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    context,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo)
  }

  // Send to external logging service in production
  if (process.env.NODE_ENV === 'production') {
    // Replace with your logging service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: context })
    
    // For now, just log to console in production too
    console.error('Production error:', errorInfo)
  }

  return errorInfo
}

// User-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return 'Your session has expired. Please sign in again.'
    }
    
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return 'You do not have permission to perform this action.'
    }
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'The requested resource was not found.'
    }

    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

// Toast error notifications
export const showErrorToast = (error: unknown, customMessage?: string) => {
  const message = customMessage || getErrorMessage(error)
  
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
  })

  // Log the error
  if (error instanceof Error) {
    logError(error)
  }
}

// Success toast helper
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#F0FDF4',
      color: '#16A34A',
      border: '1px solid #BBF7D0',
    },
  })
}

// Async error handler wrapper
export const handleAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error, { function: fn.name, args })
      showErrorToast(error)
      throw error // Re-throw to allow component-specific handling
    }
  }
}

// React error handler hook
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: Record<string, any>) => {
    logError(error as Error, context)
    showErrorToast(error)
  }

  return { handleError }
}
