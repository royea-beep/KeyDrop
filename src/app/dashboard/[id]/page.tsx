'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@royea/shared-utils/auth-context';
import { ArrowLeft, Copy, Check, Eye, EyeOff, Download, Shield, Clock, Loader2, Ban, Trash2, ClipboardList } from 'lucide-react';

interface DecryptedField {
  id: string;
  label: string;
  fieldType: string;
  value: string;
}

interface DecryptedOAuth {
  id: string;
  provider: string;
  providerLabel: string;
  accountName?: string;
  token: string;
  tokenType?: string;
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { authFetch } = useAuth();

  const [fields, setFields] = useState<DecryptedField[]>([]);
  const [oauth, setOauth] = useState<DecryptedOAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/requests/${id}/credentials`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load credentials');
          return;
        }
        const data = await res.json();
        setFields(data.fields);
        setOauth(data.oauth || []);
      } catch {
        setError('Failed to load credentials');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const copyValue = (fieldId: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(fieldId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    const lines = fields.map((f) => `${f.label}: ${f.value}`);
    for (const o of oauth) {
      lines.push(`${o.providerLabel}: ${o.token}`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId('__all__');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteRequest = async () => {
    if (!confirm('Delete this request? All encrypted data will be permanently removed.')) return;
    const res = await authFetch(`/api/requests/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard');
  };

  const revokeRequest = async () => {
    if (!confirm('Revoke this request?')) return;
    await authFetch(`/api/requests/${id}/revoke`, { method: 'POST' });
    router.push('/dashboard');
  };

  const exportEnv = () => {
    const lines = fields.map((f) => {
      const key = f.label.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      return `${key}=${f.value}`;
    });
    for (const o of oauth) {
      const key = `${o.providerLabel.toUpperCase()}_TOKEN`;
      lines.push(`${key}=${o.token}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center animate-fade-in">
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 animate-fade-in">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              copiedId === '__all__' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copiedId === '__all__' ? <Check className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
            {copiedId === '__all__' ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={exportEnv}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export .env
          </button>
          <button
            onClick={revokeRequest}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors"
            title="Revoke link"
          >
            <Ban className="w-4 h-4" />
          </button>
          <button
            onClick={deleteRequest}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Shield className="w-3.5 h-3.5" />
        <span>Decrypted in your browser. Not stored in plaintext.</span>
      </div>

      {/* Manual fields */}
      {fields.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-4">
          {fields.map((field) => (
            <div key={field.id} className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-600">{field.label}</label>
                <div className="flex items-center gap-1">
                  {field.fieldType === 'SECRET' && (
                    <button
                      onClick={() => setShowValues({ ...showValues, [field.id]: !showValues[field.id] })}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      title={showValues[field.id] ? 'Hide' : 'Show'}
                    >
                      {showValues[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => copyValue(field.id, field.value)}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                      copiedId === field.id
                        ? 'text-green-600 bg-green-50'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {copiedId === field.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === field.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="text-sm font-mono text-gray-900 break-all select-all">
                {field.fieldType === 'SECRET' && !showValues[field.id]
                  ? '\u2022'.repeat(Math.min(field.value.length, 40))
                  : field.value
                }
              </p>
            </div>
          ))}
        </div>
      )}

      {/* OAuth tokens */}
      {oauth.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {oauth.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-600">
                  {o.providerLabel}
                  {o.accountName && <span className="text-gray-400 font-normal ml-1">({o.accountName})</span>}
                </label>
                <button
                  onClick={() => copyValue(o.id, o.token)}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                    copiedId === o.id
                      ? 'text-green-600 bg-green-50'
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {copiedId === o.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === o.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-mono text-gray-900 break-all select-all">
                {showValues[o.id] ? o.token : '\u2022'.repeat(Math.min(o.token.length, 40))}
              </p>
              <button
                onClick={() => setShowValues({ ...showValues, [o.id]: !showValues[o.id] })}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1"
              >
                {showValues[o.id] ? 'Hide' : 'Show token'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
