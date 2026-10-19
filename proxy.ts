/**
 * Next.js Proxy
 * 
 * Injects pathname into request headers for doctor layout to access.
 * Required for first-login password reset redirect logic.
 * 
 * Note: Next.js 16+ uses proxy.ts instead of middleware.ts
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Clone the request headers and set pathname header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Return response with modified request headers
  // These headers are available to Server Components upstream
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Apply to all doctor routes
export const config = {
  matcher: '/doctor/:path*',
};
