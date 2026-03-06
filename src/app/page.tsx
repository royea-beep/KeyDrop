'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, ArrowRight, Lock, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl text-center animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Collect API keys<br />
            <span className="text-blue-600">securely.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
            Stop getting credentials over WhatsApp. Send your client a secure link, they submit, you retrieve. Encrypted end-to-end.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Sign In
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Lock className="w-5 h-5 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">AES-256 Encrypted</h3>
              <p className="text-xs text-gray-500">Every credential encrypted at rest. Keys never stored in plaintext.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Mobile-First</h3>
              <p className="text-xs text-gray-500">Clients open the link on their phone from WhatsApp. One tap.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Zap className="w-5 h-5 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">OAuth Connect</h3>
              <p className="text-xs text-gray-500">Client taps &quot;Connect Facebook&quot; — no API keys needed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400">
        Built by Roy &amp; Claude Opus
      </footer>
    </div>
  );
}
