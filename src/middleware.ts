import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import { auth } from '~/server/auth';

/**
 * Middleware for route protection based on user roles
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // Platform admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }
    
    if (user.role !== UserRole.PLATFORM_ADMIN) {
      // Not a platform admin, redirect to unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Association admin routes protection
  if (pathname.startsWith('/association/admin')) {
    if (!user) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }
    
    if (user.role !== UserRole.PLATFORM_ADMIN && user.role !== UserRole.ASSOCIATION_ADMIN) {
      // Not an admin, redirect to unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // If association admin, further check is needed in the page component
    // to ensure they're admin of the specific association they're trying to access
  }

  // Weaver routes protection (require any authenticated user)
  if (pathname.startsWith('/weaver') && pathname !== '/weaver/register' && pathname !== '/weaver/apply') {
    if (!user) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }
  }

  // Protected association routes
  if (pathname.startsWith('/association') && !pathname.startsWith('/association/apply') && !pathname.startsWith('/association/admin')) {
    if (!user) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }
    
    // Further checks for association membership will be handled at the page level
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/association/:path*',
    '/weaver/:path*',
    '/events/:path*',
    '/applications/:path*',
  ],
};