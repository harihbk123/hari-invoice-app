// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { ratelimit, apiRateLimit, authRateLimit } from '@/lib/ratelimit';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const ip = req.ip ?? '127.0.0.1';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  // Apply rate limiting
  try {
    // Different rate limits for different routes
    let rateLimitResult;
    
    if (req.nextUrl.pathname.startsWith('/api/')) {
      rateLimitResult = await apiRateLimit.limit(`api:${ip}`);
    } else if (req.nextUrl.pathname.startsWith('/auth/')) {
      rateLimitResult = await authRateLimit.limit(`auth:${ip}`);
    } else {
      rateLimitResult = await ratelimit.limit(`general:${ip}`);
    }

    if (!rateLimitResult.success) {
      console.warn(`Rate limit exceeded for IP: ${ip}, Path: ${req.nextUrl.pathname}`);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    res.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    res.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Continue without rate limiting if there's an error
  }

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CSP header
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
    ].join('; ')
  );

  // API routes - skip auth check
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return res;
  }

  // Authentication handling
  const supabase = createMiddlewareClient<Database>({ req, res });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Log authentication attempts for monitoring
    if (req.nextUrl.pathname.startsWith('/auth/')) {
      console.log(`Auth attempt: ${req.nextUrl.pathname}, IP: ${ip}, User-Agent: ${userAgent}`);
    }

    // Protected routes
    const protectedPaths = ['/dashboard', '/invoices', '/clients', '/expenses', '/analytics', '/settings'];
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    // Auth routes
    const authPaths = ['/auth/login', '/auth/signup', '/auth/reset-password'];
    const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path));

    // Redirect to login if accessing protected route without authentication
    if (isProtectedPath && !user) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if accessing auth routes while authenticated
    if (isAuthPath && user) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect root to appropriate page
    if (req.nextUrl.pathname === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Continue without redirecting on auth errors
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
