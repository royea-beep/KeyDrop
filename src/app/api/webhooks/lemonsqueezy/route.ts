import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * LemonSqueezy webhook handler for KeyDrop.
 * Events: subscription_created, subscription_updated, subscription_cancelled, subscription_expired
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[ls-webhook] Webhook secret not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const sigHeader = req.headers.get('x-signature');
  if (!sigHeader) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // HMAC-SHA256 verification
  const expectedHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const sigBuf = Buffer.from(sigHeader, 'hex');
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const customData = meta?.custom_data as Record<string, string> | undefined;
  const userId = customData?.user_id;
  const data = payload.data as Record<string, unknown> | undefined;
  const attrs = (data?.attributes ?? null) as Record<string, unknown> | null;

  if (!userId || !attrs) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (eventName) {
      case 'subscription_created': {
        const plan = customData?.plan || 'PRO';

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionId: String(data?.id ?? ''),
            stripeCustomerId: String((attrs.customer_id as number) ?? ''),
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at as string) : null,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'subscription_created',
            metadata: JSON.stringify({ plan, provider: 'lemonsqueezy' }),
          },
        });

        console.log(`[ls-webhook] subscription_created: user ${userId} → ${plan}`);
        break;
      }

      case 'subscription_updated': {
        const newStatus = attrs.status === 'active' ? 'ACTIVE'
          : attrs.status === 'on_trial' ? 'ACTIVE'
          : attrs.status === 'past_due' ? 'PAST_DUE'
          : attrs.status === 'cancelled' ? 'CANCELED'
          : attrs.status === 'paused' ? 'PAUSED'
          : null;

        const updateData: Record<string, unknown> = {
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at as string) : null,
        };

        // Never overwrite ACTIVE with a lesser status
        if (newStatus) {
          const current = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionStatus: true },
          });
          if (!(current?.subscriptionStatus === 'ACTIVE' && newStatus !== 'ACTIVE')) {
            updateData.subscriptionStatus = newStatus;
          }
        }

        await prisma.user.update({ where: { id: userId }, data: updateData });
        console.log(`[ls-webhook] subscription_updated: user ${userId}, status=${newStatus}`);
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'CANCELED',
            stripeSubscriptionId: null,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId,
            action: eventName,
            metadata: JSON.stringify({ provider: 'lemonsqueezy' }),
          },
        });

        console.log(`[ls-webhook] ${eventName}: user ${userId} → FREE`);
        break;
      }
    }
  } catch (err) {
    const eventId = data?.id;
    console.error(`[ls-webhook] handler failed: event=${eventName ?? 'unknown'} id=${eventId ?? 'n/a'}`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
