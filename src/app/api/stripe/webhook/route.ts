/**
 * URL path is /api/stripe/webhook for backward compatibility; handles LemonSqueezy only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * LemonSqueezy webhook handler.
 * Events: subscription_created, subscription_updated, subscription_cancelled, subscription_expired
 * Docs: https://docs.lemonsqueezy.com/help/webhooks
 */
export async function POST(req: NextRequest) {
  console.log('[WEBHOOK] Received POST request');
  const rawBody = await req.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  console.log('[WEBHOOK] Body length:', rawBody.length, 'Secret set:', !!secret);

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify signature
  const sig = req.headers.get('x-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf = Buffer.from(sig, 'utf8');
  const hmacBuf = Buffer.from(hmac, 'utf8');
  if (sigBuf.length !== hmacBuf.length) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  if (!crypto.timingSafeEqual(sigBuf, hmacBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;
  const userId = customData?.user_id;
  const attrs = payload.data?.attributes;

  console.log('[WEBHOOK] Event:', eventName, 'User ID:', userId, 'Has attrs:', !!attrs);
  if (!userId || !attrs) {
    console.log('[WEBHOOK] Missing userId or attrs, skipping');
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
            stripeSubscriptionId: String(payload.data.id),
            stripeCustomerId: String(attrs.customer_id),
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          },
        });

        await prisma.auditLog.create({
          data: { userId, action: 'subscription_created', metadata: JSON.stringify({ plan }) },
        });
        break;
      }

      case 'subscription_updated': {
        const status = attrs.status === 'active' ? 'ACTIVE'
          : attrs.status === 'past_due' ? 'PAST_DUE'
          : attrs.status === 'cancelled' ? 'CANCELED'
          : attrs.status === 'paused' ? 'PAUSED'
          : 'INACTIVE';

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status,
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          },
        });
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
          data: { userId, action: 'subscription_canceled' },
        });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
