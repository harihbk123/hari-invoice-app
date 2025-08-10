// src/lib/ratelimit.ts - Fixed to remove private property access

// In-memory rate limiting (for now, can be upgraded to Redis later)
class SimpleRateLimit {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  public limit: number // Made public so it can be accessed
  private windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
  }

  async limit(identifier: string) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Clean up old entries
    this.cleanup(windowStart)
    
    const existing = this.requests.get(identifier)
    
    if (!existing) {
      this.requests.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.windowMs
      }
    }
    
    if (now > existing.resetTime) {
      // Reset window
      this.requests.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.windowMs
      }
    }
    
    if (existing.count >= this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: existing.resetTime
      }
    }
    
    existing.count++
    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - existing.count,
      reset: existing.resetTime
    }
  }
  
  private cleanup(windowStart: number) {
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < windowStart) {
        this.requests.delete(key)
      }
    }
  }
}

// Create rate limiters
export const ratelimit = new SimpleRateLimit(100, 60 * 1000) // 100 requests per minute
export const apiRateLimit = new SimpleRateLimit(50, 60 * 1000) // 50 API calls per minute  
export const authRateLimit = new SimpleRateLimit(5, 15 * 60 * 1000) // 5 login attempts per 15 minutes
