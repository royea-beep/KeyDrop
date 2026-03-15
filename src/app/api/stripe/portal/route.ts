import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: LemonSqueezy customer portal is at https://ftable.lemonsqueezy.com/billing
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Use https://ftable.lemonsqueezy.com/billing for subscription management.' },
    { status: 410 },
  );
}
