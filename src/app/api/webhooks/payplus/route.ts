import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: Payplus webhook — replaced by /api/webhooks/lemonsqueezy.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/webhooks/lemonsqueezy instead.' },
    { status: 410 },
  );
}
