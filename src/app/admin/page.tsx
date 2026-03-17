'use client';

import { useState, useEffect, useCallback } from 'react';

interface Stats {
  total: number;
  today: number;
  userCount: number;
  byStatus: Record<string, number>;
  expiringSoon: {
    id: string;
    title: string;
    clientName: string;
    expiresAt: string;
    status: string;
  }[];
  topViewed: {
    id: string;
    title: string;
    viewCount: number;
    status: string;
    clientName: string;
  }[];
  recentRequests: {
    id: string;
    title: string;
    clientName: string;
    status: string;
    viewCount: number;
    createdAt: string;
    expiresAt: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  SUBMITTED: 'bg-green-500/20 text-green-400',
  RETRIEVED: 'bg-blue-500/20 text-blue-400',
  EXPIRED: 'bg-red-500/20 text-red-400',
  REVOKED: 'bg-gray-500/20 text-gray-400',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400'}`}
    >
      {status}
    </span>
  );
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem('keydrop_admin_key');
          setError('Invalid admin key');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
      sessionStorage.setItem('keydrop_admin_key', key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('keydrop_admin_key');
    if (stored) {
      setAdminKey(stored);
      fetchStats(stored);
    }
  }, [fetchStats]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim()) fetchStats(adminKey.trim());
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-8"
        >
          <h1 className="text-center text-2xl font-bold text-white">
            KeyDrop Admin
          </h1>
          <p className="text-center text-sm text-gray-400">
            Enter your admin key to continue
          </p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">KeyDrop Admin</h1>
            <p className="text-sm text-gray-400">Dashboard overview</p>
          </div>
          <button
            onClick={() => fetchStats(adminKey)}
            disabled={loading}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total Requests" value={stats.total} />
              <StatCard label="Today" value={stats.today} accent="blue" />
              <StatCard label="Users" value={stats.userCount} accent="green" />
              <StatCard
                label="Pending"
                value={stats.byStatus.PENDING || 0}
                accent="yellow"
              />
            </div>

            {/* Status Breakdown */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="mb-3 text-lg font-semibold">Status Breakdown</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2"
                  >
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="mb-3 text-lg font-semibold text-orange-400">
                Expiring Within 24h
              </h2>
              {stats.expiringSoon.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No requests expiring soon.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.expiringSoon.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/30 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400">{r.clientName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.status} />
                        <span className="text-sm font-mono text-orange-400">
                          {timeUntil(r.expiresAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Viewed */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="mb-3 text-lg font-semibold text-purple-400">
                Top Viewed Requests
              </h2>
              {stats.topViewed.length === 0 ? (
                <p className="text-sm text-gray-500">No requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.topViewed.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/30 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400">{r.clientName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.status} />
                        <span className="text-sm font-mono text-blue-400">
                          {r.viewCount} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Requests */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="mb-3 text-lg font-semibold">Recent Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-400">
                      <th className="pb-2 pr-4">Title</th>
                      <th className="pb-2 pr-4">Client</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Views</th>
                      <th className="pb-2 pr-4">Created</th>
                      <th className="pb-2">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRequests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-gray-800/50 text-gray-300"
                      >
                        <td className="py-2.5 pr-4 font-medium text-white">
                          {r.title}
                        </td>
                        <td className="py-2.5 pr-4">{r.clientName}</td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-2.5 pr-4 font-mono">
                          {r.viewCount}
                        </td>
                        <td className="py-2.5 pr-4 text-xs">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="py-2.5 text-xs">
                          {formatDate(r.expiresAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };
  const valueColor = accent ? colorMap[accent] || 'text-white' : 'text-white';

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
