// src/app/layout.tsx - Final Enhanced Version
'use client'

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import { initializeMonitoring } from '@/lib/monitoring'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    // Initialize monitoring and error tracking
    if (typeof window !== 'undefined') {
      const monitoring = initializeMonitoring()
      
      // Track page load performance
      monitoring?.performanceMonitor?.measurePageLoad()
      
      // Log application start
      console.log('🚀 Invoice Manager initialized')
    }
  }, [])

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Professional invoice and expense management system" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        <title>Invoice Manager - Professional Invoice & Expense Management</title>
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Skip to main content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-white text-black px-4 py-2 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Skip to main content
            </a>
            
            <div id="root" className="min-h-screen bg-background">
              <main id="main-content" role="main">
                {children}
              </main>
            </div>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            {/* Accessibility announcements */}
            <div
              id="a11y-announcements"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
