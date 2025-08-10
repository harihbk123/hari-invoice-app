// src/app/api/errors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/ratelimit'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success, limit, remaining, reset } = await apiRateLimit.limit(`errors:${ip}`)
    
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
    const { message, stack, name, timestamp, url, userAgent, context } = body
    
    // Validate required fields
    if (!message || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: message, timestamp' },
        { status: 400 }
      )
    }
    
    // Get additional request info
    const headersList = headers()
    const requestUserAgent = headersList.get('user-agent') || userAgent || 'unknown'
    const referer = headersList.get('referer') || ''
    
    const errorEvent = {
      message,
      stack,
      name,
      timestamp: new Date(timestamp),
      url,
      userAgent: requestUserAgent,
      referer,
      context,
      ip,
      environment: process.env.NODE_ENV,
      severity: determineSeverity(message, stack),
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry
      // Sentry.captureException(new Error(message), {
      //   extra: context,
      //   tags: { environment: process.env.NODE_ENV }
      // })
      
      // Example: Send to custom logging service
      // await sendToLoggingService(errorEvent)
      
      // Example: Store in database for analysis
      // await storeError(errorEvent)
      
      console.error('🐛 Error event received:', errorEvent)
      
      // Send critical errors to monitoring service immediately
      if (errorEvent.severity === 'critical') {
        await sendCriticalAlert(errorEvent)
      }
    } else {
      console.error('🐛 Error event (dev):', errorEvent)
    }
    
    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      }
    })
    
  } catch (error) {
    console.error('Error API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Determine error severity based on message and stack
function determineSeverity(message: string, stack?: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerMessage = message.toLowerCase()
  
  // Critical errors
  if (
    lowerMessage.includes('security') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('payment') ||
    lowerMessage.includes('database') ||
    lowerMessage.includes('auth')
  ) {
    return 'critical'
  }
  
  // High severity errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('server') ||
    lowerMessage.includes('api')
  ) {
    return 'high'
  }
  
  // Medium severity errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('format') ||
    lowerMessage.includes('parse')
  ) {
    return 'medium'
  }
  
  // Default to medium if we can't determine
  return 'medium'
}

// Send critical alerts (implement your alerting mechanism)
async function sendCriticalAlert(errorEvent: any) {
  // Example: Send to Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Critical Error Alert`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Critical Error Detected*\n\n*Message:* ${errorEvent.message}\n*URL:* ${errorEvent.url}\n*Environment:* ${errorEvent.environment}\n*Time:* ${errorEvent.timestamp}`
              }
            }
          ]
        })
      })
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError)
    }
  }
  
  // Example: Send email alert
  // await sendEmailAlert(errorEvent)
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'error-tracking'
  })
}
