// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback for development
const cache = new Map()

export const ratelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL 
    ? Redis.fromEnv()
    : {
        // In-memory fallback for development
        async get(key: string) { return cache.get(key) },
        async set(key: string, value: any, options?: { ex?: number }) {
          cache.set(key, value)
          if (options?.ex) {
            setTimeout(() => cache.delete(key), options.ex * 1000)
          }
        },
        async incr(key: string) {
          const current = cache.get(key) || 0
          const next = current + 1
          cache.set(key, next)
          return next
        },
        async expire(key: string, seconds: number) {
          setTimeout(() => cache.delete(key), seconds * 1000)
        }
      } as any,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
})

// API specific rate limits
export const apiRateLimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL 
    ? Redis.fromEnv()
    : cache as any,
  limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 API calls per minute
})

// Authentication rate limits
export const authRateLimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL 
    ? Redis.fromEnv()
    : cache as any,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 login attempts per 15 minutes
})
