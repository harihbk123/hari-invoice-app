// src/middleware.ts - Simplified for initial deployment
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const ip = req.ip ?? '127.0.0.1';

  // Basic security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // API routes - skip auth check but add security headers
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return res;
  }

  // Authentication handling
  const supabase = createMiddlewareClient<Database>({ req, res });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
