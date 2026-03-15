import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: Use /api/checkout (LemonSqueezy) instead.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/checkout instead.' },
    { status: 410 },
  );
}
