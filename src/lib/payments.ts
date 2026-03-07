/**
 * Payment provider for 1-2Clicks.
 * Uses LemonSqueezy (works from Israel, acts as Merchant of Record).
 *
 * Setup: https://app.lemonsqueezy.com
 * 1. Create account
 * 2. Create Store
 * 3. Create 2 Products (Pro $19/mo, Team $49/mo) with variants
 * 4. Copy API key + variant IDs into .env
 */

import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  type Checkout,
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
