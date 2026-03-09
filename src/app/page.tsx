'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@royea/shared-utils/auth-context';
import { Shield, ArrowRight, Lock, Link2, LayoutTemplate, Check, ArrowRightCircle } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <a href="#main-content" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible">
        Skip to main content
      </a>
      {/* Hero */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">KeyDrop</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Stop getting API keys over WhatsApp.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Send your client a secure link. They submit credentials once. You get them encrypted. No more screenshots, no more copy-paste in chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Get Started Free <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-10">Built for security and speed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">AES-256 encrypted</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Every credential is encrypted at rest. Keys are never stored in plaintext. Only you can decrypt with your key.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">One-time links</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Each request gets a unique link. After the client submits, the link expires. No reuse, no leaks.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <LayoutTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">Service templates</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Pre-built templates for Stripe, Facebook, Google, and more. One click to create a request your client can fill in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Create request</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Pick a template or custom fields. Add labels (e.g. API Key, Webhook Secret).</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRightCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-4 hidden sm:block" aria-hidden="true" />
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share link</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Send the one-time link to your client (email, Slack, or yes — even WhatsApp).</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Collect securely</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">They submit. You retrieve the decrypted values in your dashboard. Link expires.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Simple pricing</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-lg mx-auto">Start free. Upgrade when you need more requests.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">FREE</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">$0<span className="text-base font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">5 requests/month · 5 fields</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> AES-256 encryption</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> One-time links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> Basic templates</li>
              </ul>
              <Link href="/register" className="mt-6 inline-flex justify-center items-center gap-2 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-colors">
                Get Started
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-600 shadow-lg flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">PRO</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">$19<span className="text-base font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">100 requests/month · 20 fields</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> Everything in Free</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> All service templates</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> Priority support</li>
              </ul>
              <Link href="/register" className="mt-6 inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Start Pro
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">TEAM</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">$49<span className="text-base font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Unlimited requests · 20 fields</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> Unlimited requests</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" /> For agencies &amp; teams</li>
              </ul>
              <Link href="/register" className="mt-6 inline-flex justify-center items-center gap-2 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-colors">
                Start Team
              </Link>
            </div>
          </div>
        </section>

        {/* Social proof placeholder */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Trusted by developers and agencies</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 italic">“We used to chase API keys in Slack and email. KeyDrop cut that time to zero. One link, done.”</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">— Launching soon. Your quote here.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="font-medium text-gray-700 dark:text-gray-300">KeyDrop</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sign In</Link>
            <Link href="/register" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Register</Link>
            <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
            <Link href="/billing" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Pricing</Link>
          </nav>
          <p className="text-xs text-gray-400 dark:text-gray-500">Built with care · Encrypted by default</p>
        </div>
      </footer>
    </div>
  );
}
