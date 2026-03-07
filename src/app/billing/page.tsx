'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Shield, Check, Zap, Crown, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserBilling {
  plan: string;
  subscriptionStatus: string;
  requestsThisMonth: number;
  currentPeriodEnd: string | null;
}

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    price: 0,
    icon: Shield,
    features: ['5 requests/month', '5 fields per request', 'AES-256 encryption', 'One-time links'],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 19,
    icon: Zap,
    popular: true,
    features: ['100 requests/month', '20 fields per request', 'All service templates', 'Priority support', 'Custom branding'],
  },
  {
    key: 'TEAM',
    name: 'Team',
    price: 49,
    icon: Crown,
    features: ['Unlimited requests', '20 fields per request', 'All Pro features', 'Team members (soon)', 'API access (soon)'],
  },
];

export default function BillingPage() {
  const { user, authFetch, loading: authLoading } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<UserBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchBilling();
  }, [user, authLoading]);

  const fetchBilling = async () => {
    try {
      const res = await authFetch('/api/billing');
      if (res.ok) setBilling(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan);
    try {
      const res = await authFetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch {
      toast.error('Failed to start checkout');
    }
    setCheckoutLoading(null);
  };

  const handlePortal = async () => {
    try {
      const res = await authFetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('No billing portal available');
      }
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = billing?.plan || 'FREE';
  const requestsUsed = billing?.requestsThisMonth || 0;
  const limit = currentPlan === 'FREE' ? 5 : currentPlan === 'PRO' ? 100 : -1;
  const usagePercent = limit > 0 ? Math.min((requestsUsed / limit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">Billing</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Usage</h2>
            {billing?.subscriptionStatus === 'ACTIVE' && (
              <button
                onClick={handlePortal}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Manage Subscription <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">{requestsUsed}</span>
            <span className="text-gray-500">/ {limit > 0 ? limit : '\u221E'} requests this month</span>
          </div>
          {limit > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
          {billing?.currentPeriodEnd && (
            <p className="text-xs text-gray-400 mt-2">
              Renews {new Date(billing.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Plans */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const Icon = plan.icon;

            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-xl border-2 p-6 transition-shadow ${
                  plan.popular ? 'border-blue-500 shadow-lg' : isCurrent ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${plan.popular ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/mo</span>}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    Current Plan
                  </button>
                ) : plan.key === 'FREE' ? (
                  <div />
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={!!checkoutLoading}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } disabled:opacity-50`}
                  >
                    {checkoutLoading === plan.key ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : currentPlan !== 'FREE' ? 'Switch Plan' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
