import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutUrl, PLANS, type PlanKey } from '@/lib/payments';
import { prisma } from '@/lib/db';
import { withAuth, type AuthRouteHandler } from '@royea/shared-utils/auth-guard';

export const POST = withAuth((async (req: Parameters<AuthRouteHandler>[0], userId: string) => {
  try {
    const { plan } = await req.json() as { plan: string };

    if (plan !== 'PRO' && plan !== 'TEAM') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const url = await createCheckoutUrl({
      plan: plan as 'PRO' | 'TEAM',
      userId: user.id,
      email: user.email,
      name: user.name,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('LemonSqueezy checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}) as unknown as AuthRouteHandler) as unknown as (req: NextRequest, ctx: { params: Promise<Record<string, never>> }) => Promise<Response>;
