import { NextRequest, NextResponse } from 'next/server';

// Public API routes that don't require authentication
const PUBLIC_ROUTE_PREFIXES = [
  '/api/auth/',
  '/api/validate/',
  '/api/submit/',
  '/api/stripe/webhook',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply auth checks to API routes
  if (!isApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // All other API routes require authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the JWT token
  // Note: Full verification happens in withAuth/auth-guard.
  // Middleware does a lightweight structural check to reject obviously invalid requests early.
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    // Decode payload to check expiry
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.userId || !payload.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
