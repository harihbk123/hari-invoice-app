// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/ratelimit'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success, limit, remaining, reset } = await apiRateLimit.limit(`analytics:${ip}`)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          }
        }
      )
    }
    
    const body = await request.json()
    const { type, data, timestamp } = body
    
    // Validate required fields
    if (!type || !data || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data, timestamp' },
        { status: 400 }
      )
    }
    
    // Get additional request info
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const referer = headersList.get('referer') || ''
    
    const analyticsEvent = {
      type,
      data,
      timestamp: new Date(timestamp),
      ip,
      userAgent,
      referer,
      environment: process.env.NODE_ENV,
    }
    
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external analytics service
      // await sendToAnalyticsService(analyticsEvent)
      
      // Example: Store in database
      // await storeAnalyticsEvent(analyticsEvent)
      
      console.log('📊 Analytics event received:', analyticsEvent)
    } else {
      console.log('📊 Analytics event (dev):', analyticsEvent)
    }
    
    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      }
    })
    
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'analytics'
  })
}
