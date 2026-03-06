'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, LogOut, Plus, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">KeyDrop</span>
            </a>
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard/new"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Request
            </a>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">{user.name}</span>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
