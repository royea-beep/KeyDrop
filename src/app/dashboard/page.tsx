'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Copy, Check, ExternalLink, Trash2, Eye, Clock, ChevronRight, Inbox, Plus } from 'lucide-react';

interface RequestField {
  id: string;
  label: string;
  fieldType: string;
  hasValue: boolean;
}

interface OAuthConn {
  id: string;
  provider: string;
  providerLabel: string;
  status: string;
}

interface CredentialRequest {
  id: string;
  title: string;
  clientName: string;
  projectName?: string;
  status: string;
  token: string;
  link: string;
  expiresAt: string;
  createdAt: string;
  submittedAt?: string;
  fields: RequestField[];
  oauthConnections: OAuthConn[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50' },
  VIEWED: { label: 'Viewed', color: 'text-blue-700', bg: 'bg-blue-50' },
  SUBMITTED: { label: 'Submitted', color: 'text-green-700', bg: 'bg-green-50' },
  RETRIEVED: { label: 'Retrieved', color: 'text-gray-700', bg: 'bg-gray-100' },
  EXPIRED: { label: 'Expired', color: 'text-gray-500', bg: 'bg-gray-50' },
  REVOKED: { label: 'Revoked', color: 'text-red-700', bg: 'bg-red-50' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

export default function DashboardPage() {
  const { authFetch } = useAuth();
  const [requests, setRequests] = useState<CredentialRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await authFetch('/api/requests');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request? All encrypted data will be permanently removed.')) return;
    const res = await authFetch(`/api/requests/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h2>
        <p className="text-gray-500 mb-6">Create your first credential request and send it to a client.</p>
        <a
          href="/dashboard/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </a>
      </div>
    );
  }

  const active = requests.filter((r) => ['PENDING', 'VIEWED'].includes(r.status));
  const completed = requests.filter((r) => ['SUBMITTED', 'RETRIEVED'].includes(r.status));
  const inactive = requests.filter((r) => ['EXPIRED', 'REVOKED'].includes(r.status));

  const renderCard = (req: CredentialRequest) => {
    const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
    const hasCredentials = req.status === 'SUBMITTED' || req.status === 'RETRIEVED';

    return (
      <div
        key={req.id}
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow animate-slide-up"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{req.title}</h3>
            <p className="text-sm text-gray-500 truncate">
              {req.clientName}
              {req.projectName && <span> &middot; {req.projectName}</span>}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color} shrink-0 ml-3`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(req.createdAt)}
          </span>
          <span>{req.fields.length} fields</span>
          {req.oauthConnections.length > 0 && (
            <span>{req.oauthConnections.length} OAuth</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(req.status === 'PENDING' || req.status === 'VIEWED') && (
            <CopyButton text={req.link} />
          )}
          {hasCredentials && (
            <a
              href={`/dashboard/${req.id}`}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
            >
              <Eye className="w-3 h-3" />
              View Credentials
            </a>
          )}
          {!hasCredentials && req.status !== 'EXPIRED' && req.status !== 'REVOKED' && (
            <a
              href={req.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Preview
            </a>
          )}
          <div className="flex-1" />
          <button
            onClick={() => deleteRequest(req.id)}
            className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Active ({active.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(renderCard)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Completed ({completed.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map(renderCard)}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Inactive ({inactive.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactive.map(renderCard)}
          </div>
        </section>
      )}
    </div>
  );
}
