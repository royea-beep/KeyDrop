/**
 * Payment provider for KeyDrop.
 * Uses LemonSqueezy (works from Israel, acts as Merchant of Record).
 * Store: ftable (ID 309460)
 */

import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';

function initLS() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error('LEMONSQUEEZY_API_KEY not set');
  lemonSqueezySetup({ apiKey: key });
}

export const PLANS = {
  FREE: {
    name: 'Free',
    requestsPerMonth: 5,
    maxFields: 5,
    price: 0,
  },
  PRO: {
    name: 'Pro',
    requestsPerMonth: 100,
    maxFields: 20,
    price: 19,
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
  },
  TEAM: {
    name: 'Team',
    requestsPerMonth: -1, // unlimited
    maxFields: 20,
    price: 49,
    variantId: process.env.LEMONSQUEEZY_TEAM_VARIANT_ID || '',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanKey] || PLANS.FREE;
}

/** Public plan display for billing UI (no variant IDs exposed). */
export function getPlanDisplay(): { key: string; name: string; price: number; currency: string; features: string[]; popular?: boolean }[] {
  return [
    { key: 'FREE', name: 'Free', price: 0, currency: '', features: ['5 requests/month', '5 fields per request', 'AES-256 encryption', 'One-time links'] },
    { key: 'PRO', name: 'Pro', price: 19, currency: '$', popular: true, features: ['100 requests/month', '20 fields per request', 'All service templates', 'Priority support', 'Custom branding'] },
    { key: 'TEAM', name: 'Team', price: 49, currency: '$', features: ['Unlimited requests', '20 fields per request', 'All Pro features', 'Priority support', 'Custom branding'] },
  ];
}

/** Create a LemonSqueezy checkout URL for a plan */
export async function createCheckoutUrl(opts: {
  plan: 'PRO' | 'TEAM';
  userId: string;
  email: string;
  name: string;
  successUrl: string;
}): Promise<string> {
  initLS();

  const planConfig = PLANS[opts.plan];
  if (!('variantId' in planConfig) || !planConfig.variantId) {
    throw new Error(`No variant ID configured for plan ${opts.plan}`);
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID not set');

  const { data, error } = await createCheckout(storeId, planConfig.variantId, {
    checkoutData: {
      email: opts.email,
      name: opts.name,
      custom: {
        user_id: opts.userId,
        plan: opts.plan,
      },
    },
    productOptions: {
      redirectUrl: opts.successUrl,
    },
  });

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create checkout');
  }

  return (data as { data: { attributes: { url: string } } }).data.attributes.url;
}

/** Get subscription details */
export async function getSubscriptionDetails(subscriptionId: string) {
  initLS();
  const { data, error } = await getSubscription(subscriptionId);
  if (error) throw new Error(error.message);
  return data;
}

/** Cancel a subscription */
export async function cancelSub(subscriptionId: string) {
  initLS();
  const { error } = await cancelSubscription(subscriptionId);
  if (error) throw new Error(error.message);
}
