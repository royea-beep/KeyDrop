import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, type AuthRouteHandler } from '@royea/shared-utils/auth-guard';

export const GET = withAuth((async (_req: Parameters<AuthRouteHandler>[0], userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      requestsThisMonth: true,
      currentPeriodEnd: true,
      billingCycleStart: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}) as unknown as AuthRouteHandler) as unknown as (req: NextRequest, ctx: { params: Promise<Record<string, never>> }) => Promise<Response>;
