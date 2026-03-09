import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, type AuthRouteHandler } from '@royea/shared-utils/auth-guard';

/**
 * LemonSqueezy customer portal redirect.
 * Uses the customer portal URL from LemonSqueezy (no API call needed).
 */
export const POST = withAuth((async (_req: Parameters<AuthRouteHandler>[0], userId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    }

    // LemonSqueezy customer portal URL pattern
    const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG || '';
    const portalUrl = `https://${storeSlug}.lemonsqueezy.com/billing`;

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}) as unknown as AuthRouteHandler) as unknown as (req: NextRequest, ctx: { params: Promise<Record<string, never>> }) => Promise<Response>;
