// src/lib/monitoring.ts

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceEntry[]> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  // Measure page load performance
  measurePageLoad() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const metrics = {
        // Core Web Vitals
        ttfb: navigation.responseStart - navigation.requestStart,
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        lcp: 0, // Will be set by LCP observer
        cls: 0, // Will be set by CLS observer
        fid: 0, // Will be set by FID observer
        
        // Other metrics
        domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
        resourceLoad: navigation.loadEventEnd - navigation.fetchStart,
      }
      
      this.reportMetrics('page-load', metrics)
    })
    
    // Largest Contentful Paint
    this.observeLCP()
    
    // Cumulative Layout Shift
    this.observeCLS()
    
    // First Input Delay
    this.observeFID()
  }
  
  private observeLCP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return
    
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.reportMetrics('lcp', { value: lastEntry.startTime })
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }
  
  private observeCLS() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return
    
    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]
          
          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += (entry as any).value
            sessionEntries.push(entry)
          } else {
            sessionValue = (entry as any).value
            sessionEntries = [entry]
          }
          
          if (sessionValue > clsValue) {
            clsValue = sessionValue
            this.reportMetrics('cls', { value: clsValue })
          }
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  private observeFID() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportMetrics('fid', { value: (entry as any).processingStart - entry.startTime })
        break // Only report the first FID
      }
    }).observe({ entryTypes: ['first-input'] })
  }
  
  // Measure custom timing
  startTiming(name: string) {
    if (typeof window === 'undefined') return
    performance.mark(`${name}-start`)
  }
  
  endTiming(name: string) {
    if (typeof window === 'undefined') return
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measurement = performance.getEntriesByName(name, 'measure')[0]
    this.reportMetrics('custom-timing', { name, duration: measurement.duration })
  }
  
  // Report metrics to analytics service
  private reportMetrics(type: string, data: any) {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', type, {
        custom_map: data,
        send_to: process.env.NEXT_PUBLIC_GA_ID,
      })
    }
    
    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() }),
      }).catch(console.error)
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric [${type}]:`, data)
    }
  }
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker
  
  static getInstance(): ErrorTracker {
    if (!this.instance) {
      this.instance = new ErrorTracker()
    }
    return this.instance
  }
  
  init() {
    if (typeof window === 'undefined') return
    
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'unhandled-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled-promise-rejection',
      })
    })
  }
  
  captureError(error: Error, context?: Record<string, any>) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      context,
    }
    
    // Send to error tracking service (replace with Sentry, Bugsnag, etc.)
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      }).catch(console.error)
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🐛 Error captured:', errorInfo)
    }
  }
  
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    const logInfo = {
      message,
      level,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      context,
    }
    
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logInfo),
      }).catch(console.error)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console[level]('📝 Message captured:', logInfo)
    }
  }
}

// User session tracking
export class SessionTracker {
  private sessionId: string
  private startTime: number
  
  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.init()
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private init() {
    if (typeof window === 'undefined') return
    
    // Track page views
    this.trackPageView()
    
    // Track user interactions
    this.trackUserInteractions()
    
    // Track session end
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })
    
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden')
      } else {
        this.trackEvent('page_visible')
      }
    })
  }
  
  trackPageView(path?: string) {
    this.trackEvent('page_view', {
      path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    })
  }
  
  trackEvent(eventName: string, properties?: Record<string, any>) {
    const event = {
      sessionId: this.sessionId,
      eventName,
      properties,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
    
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Event tracked:', event)
    }
  }
  
  private trackUserInteractions() {
    if (typeof window === 'undefined') return
    
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.matches('button, a, [role="button"]')) {
        this.trackEvent('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50),
          className: target.className,
        })
      }
    })
  }
  
  private endSession() {
    const sessionDuration = Date.now() - this.startTime
    this.trackEvent('session_end', {
      duration: sessionDuration,
      sessionId: this.sessionId,
    })
  }
}

// Initialize monitoring
export const initializeMonitoring = () => {
  if (typeof window === 'undefined') return
  
  const performanceMonitor = PerformanceMonitor.getInstance()
  const errorTracker = ErrorTracker.getInstance()
  const sessionTracker = new SessionTracker()
  
  performanceMonitor.measurePageLoad()
  errorTracker.init()
  
  return {
    performanceMonitor,
    errorTracker,
    sessionTracker,
  }
}

// Export singleton instances
export const performanceMonitor = typeof window !== 'undefined' ? PerformanceMonitor.getInstance() : null
export const errorTracker = typeof window !== 'undefined' ? ErrorTracker.getInstance() : null

// Global error handling
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
