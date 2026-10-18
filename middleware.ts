/**
 * Next.js Middleware
 * 
 * Injects pathname into headers for use in Server Components.
 * This allows the doctor layout to check the current path and prevent redirect loops.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add pathname to headers so layouts can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Apply middleware to doctor routes
export const config = {
  matcher: '/doctor/:path*',
};
