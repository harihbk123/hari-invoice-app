// src/lib/accessibility.ts

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management
export const focusElement = (selector: string | HTMLElement, options?: FocusOptions) => {
  let element: HTMLElement | null = null
  
  if (typeof selector === 'string') {
    element = document.querySelector(selector)
  } else {
    element = selector
  }
  
  if (element) {
    element.focus(options)
    return true
  }
  
  console.warn(`Could not focus element: ${selector}`)
  return false
}

// Trap focus within a container (for modals, dropdowns)
export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Allow components to handle escape
      container.dispatchEvent(new CustomEvent('escape'))
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  if (firstElement) {
    firstElement.focus()
  }
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

// ARIA label helpers
export const generateId = (prefix: string = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// Keyboard navigation helpers
export const isActionKey = (e: KeyboardEvent) => {
  return e.key === 'Enter' || e.key === ' '
}

export const handleActionKeyPress = (e: KeyboardEvent, callback: () => void) => {
  if (isActionKey(e)) {
    e.preventDefault()
    callback()
  }
}

// Color contrast checker (basic implementation)
export const getContrastRatio = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  
  if (!fg || !bg) return 0
  
  const fgLum = getLuminance(fg.r, fg.g, fg.b)
  const bgLum = getLuminance(bg.r, bg.g, bg.b)
  
  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export const checkColorContrast = (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA') => {
  const ratio = getContrastRatio(foreground, background)
  const required = level === 'AA' ? 4.5 : 7
  
  return {
    ratio,
    passes: ratio >= required,
    level,
    required
  }
}

// Screen reader only text
export const srOnly = 'sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0'

// Reduced motion helper
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// High contrast mode detection
export const prefersHighContrast = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

// React hook for accessibility features
export const useAccessibility = () => {
  return {
    announceToScreenReader,
    focusElement,
    trapFocus,
    generateId,
    handleActionKeyPress,
    checkColorContrast,
    prefersReducedMotion: prefersReducedMotion(),
    prefersHighContrast: prefersHighContrast()
  }
}
