'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BUILT_IN_TEMPLATES, type ServiceTemplate } from '@/lib/templates';
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Copy, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface FieldDef {
  id: string;
  label: string;
  fieldType: 'TEXT' | 'SECRET' | 'URL';
  required: boolean;
  placeholder?: string;
  hint?: string;
  validationPattern?: string;
}

interface OAuthDef {
  provider: string;
  providerLabel: string;
  scopes?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const fieldCounterRef = useState(() => ({ current: 0 }))[0];

  // Form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [note, setNote] = useState('');
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [oauthProviders, setOauthProviders] = useState<OAuthDef[]>([]);

  const [templateSlug, setTemplateSlug] = useState<string | undefined>(undefined);

  // UI state
  const [showTemplates, setShowTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ link: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const applyTemplate = (template: ServiceTemplate) => {
    setTemplateSlug(template.slug);
    setTitle(`${template.name} API keys`);
    setFields(template.fields.map((f, i) => ({
      id: `field_${++fieldCounterRef.current}`,
      label: f.label,
      fieldType: f.fieldType,
      required: f.required,
      placeholder: f.placeholder,
      hint: f.hint,
      validationPattern: f.validationPattern,
    })));
    if (template.authMethod === 'OAUTH' || template.authMethod === 'BOTH') {
      setOauthProviders([{
        provider: template.oauthProvider || template.slug,
        providerLabel: template.name,
        scopes: template.oauthScopes,
      }]);
    } else {
      setOauthProviders([]);
    }
    setShowTemplates(false);
  };

  const addField = () => {
    setFields([...fields, {
      id: `field_${++fieldCounterRef.current}`,
      label: '',
      fieldType: 'TEXT',
      required: true,
    }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldDef>) => {
    setFields(fields.map((f) => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0 && oauthProviders.length === 0) {
      setError('Add at least one field or OAuth connection');
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      setError('All fields must have a label');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await authFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          clientName,
          clientEmail: clientEmail || undefined,
          clientPhone: clientPhone || undefined,
          projectName: projectName || undefined,
          note: note || undefined,
          language,
          expiresInHours,
          templateSlug,
          fields: fields.map((f) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            placeholder: f.placeholder || undefined,
            hint: f.hint || undefined,
            validationPattern: f.validationPattern || undefined,
          })),
          oauthProviders: oauthProviders.length > 0 ? oauthProviders : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create request');
      }

      const data = await res.json();
      setResult({ link: data.link });
      toast.success('Request created! Link is ready to share.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create request';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen with link
  if (result) {
    return (
      <div className="max-w-lg mx-auto py-8 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Created!</h2>
          <p className="text-gray-500 mb-6">Send this link to {clientName}:</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 break-all font-mono">{result.link}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 animate-fade-in">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Credential Request</h1>

      {/* Template picker */}
      {showTemplates && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick start with a template</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUILT_IN_TEMPLATES.map((t) => (
              <button
                key={t.slug}
                onClick={() => applyTemplate(t)}
                className="text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{t.name}</span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  {t.authMethod === 'OAUTH' ? 'OAuth' : `${t.fields.length} fields`}
                </span>
              </button>
            ))}
            <button
              onClick={() => { setShowTemplates(false); addField(); }}
              className="text-left p-3 rounded-lg border border-dashed border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-500">Custom</span>
              <span className="block text-xs text-gray-400 mt-0.5">Define your own</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Facebook API keys for Website"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-gray-400">(opt)</span></label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note for client <span className="text-gray-400">(opt)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Instructions or context shown to the client"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'he')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="en">English</option>
                <option value="he">Hebrew</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link expires in</label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Fields</h3>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No fields yet. Add a field or pick a template above.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateField(field.id, { fieldType: e.target.value as FieldDef['fieldType'] })}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="TEXT">Text</option>
                      <option value="SECRET">Secret</option>
                      <option value="URL">URL</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="text-gray-300 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {submitting ? 'Creating...' : 'Create & Get Link'}
        </button>
      </form>
    </div>
  );
}
