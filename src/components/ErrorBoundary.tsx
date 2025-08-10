// src/components/ErrorBoundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // You can replace this with Sentry, LogRocket, etc.
      window.gtag?.('event', 'exception', {
        description: error.toString(),
        fatal: false,
      })
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="mt-4 text-center">
              <h1 className="text-lg font-medium text-gray-900">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Show error details (Development only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="text-red-600 font-semibold">Error:</div>
                  <div className="mb-2">{this.state.error.toString()}</div>
                  
                  {this.state.errorInfo && (
                    <>
                      <div className="text-red-600 font-semibold">Stack trace:</div>
                      <div>{this.state.errorInfo.componentStack}</div>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // Send to error tracking service
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'exception', {
        description: error.toString(),
        fatal: false,
      })
    }
  }
}
