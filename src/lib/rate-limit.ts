import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// Login: 5 attempts per 15 min per IP
export const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes
  keyPrefix: 'login',
});

// Register: 3 attempts per hour per IP
export const registerLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60, // 1 hour
  keyPrefix: 'register',
});

// Submit credentials: 10 attempts per hour per IP
export const submitLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60, // 1 hour
  keyPrefix: 'submit',
});

// Validate token: 30 attempts per 15 min per IP
export const validateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 15 * 60, // 15 minutes
  keyPrefix: 'validate',
});

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1';
}

/**
 * Apply rate limiting to a request. Returns null if allowed, or a 429 response if rate limited.
 */
export async function applyRateLimit(
  limiter: RateLimiterMemory,
  req: NextRequest
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await limiter.consume(ip);
    return null; // allowed
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(err.msBeforeNext / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }
    // Unknown error — don't block the request
    return null;
  }
}
