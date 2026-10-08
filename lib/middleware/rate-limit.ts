/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiter for API routes
 * For production with multiple servers, use Redis-based solution (upstash/ratelimit)
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientId(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Rate limit middleware
 * 
 * Usage in API routes:
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const rateLimitResult = await rateLimit(req, {
 *     windowMs: 60 * 1000, // 1 minute
 *     max: 10, // 10 requests per minute
 *   });
 *   
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Continue with normal logic
 * }
 * ```
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; response?: NextResponse }> {
  const clientId = getClientId(req);
  const now = Date.now();
  const key = `${clientId}:${req.nextUrl.pathname}`;

  let entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return { success: true };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: config.message || 'Too many requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      ),
    };
  }

  // Still within limit
  return { success: true };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Strict limits for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  
  // Moderate limits for write operations
  write: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests
    message: 'Too many requests. Please slow down.',
  },
  
  // Generous limits for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests
    message: 'Too many requests. Please slow down.',
  },
  
  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  
  // For file uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads
    message: 'Too many upload requests. Please slow down.',
  },
};

/**
 * IP-based rate limiter (stricter, for sensitive endpoints)
 */
export async function strictRateLimit(
  req: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<{ success: boolean; response?: NextResponse }> {
  return rateLimit(req, {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: 'Too many requests from this IP. Please try again later.',
    ...config,
  });
}
