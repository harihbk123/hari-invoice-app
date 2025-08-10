// src/middleware.ts - Updated for @supabase/ssr
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Basic security headers
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // API routes - skip auth check but add security headers
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  try {
    // This will refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/invoices', '/clients', '/expenses', '/analytics', '/settings']
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    // Auth routes
    const authPaths = ['/auth/login', '/auth/signup', '/auth/reset-password']
    const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path))

    // Redirect to login if accessing protected route without authentication
    if (isProtectedPath && !user) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes while authenticated
    if (isAuthPath && user) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect root to appropriate page
    if (req.nextUrl.pathname === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Continue without redirecting on auth errors
  }

  return supabaseResponse
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
}
