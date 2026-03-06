'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, AlertCircle, Eye, EyeOff, Copy, Loader2, HelpCircle } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  fieldType: 'TEXT' | 'SECRET' | 'URL';
  required: boolean;
  placeholder?: string;
  hint?: string;
  validationPattern?: string;
}

interface OAuthConn {
  id: string;
  provider: string;
  providerLabel: string;
  status: string;
}

interface RequestData {
  valid: boolean;
  reason?: string;
  developer: { name: string; businessName?: string; logoUrl?: string };
  clientName: string;
  projectName?: string;
  note?: string;
  language: string;
  fields: Field[];
  oauthConnections: OAuthConn[];
  expiresAt: string;
}

const t = {
  en: {
    loading: 'Loading...',
    expired: 'This link has expired',
    expiredSub: 'Please ask the developer to send a new link.',
    submitted: 'Already submitted',
    submittedSub: 'Your credentials have already been securely delivered.',
    revoked: 'This link is no longer active',
    revokedSub: 'Please contact the developer for a new link.',
    notFound: 'Link not found',
    notFoundSub: 'This link doesn\'t exist or has been removed.',
    needsAccess: 'needs access to your accounts',
    forProject: 'for',
    secureNote: 'Your data is encrypted and delivered securely',
    required: 'Required',
    optional: 'Optional',
    submit: 'Submit Securely',
    submitting: 'Encrypting & sending...',
    success: 'Sent securely!',
    successSub: 'Your credentials have been encrypted and delivered.',
    successClose: 'You can close this page.',
    error: 'Something went wrong. Please try again.',
    connectWith: 'Connect with',
    orEnterManually: 'Or enter manually',
    stuck: 'I need help with this',
    copied: 'Copied!',
  },
  he: {
    loading: '...טוען',
    expired: 'הלינק פג תוקף',
    expiredSub: 'בבקשה בקשו מהמפתח לשלוח לינק חדש.',
    submitted: 'כבר נשלח',
    submittedSub: 'הפרטים שלכם כבר הועברו בצורה מאובטחת.',
    revoked: 'הלינק כבר לא פעיל',
    revokedSub: 'צרו קשר עם המפתח לקבלת לינק חדש.',
    notFound: 'הלינק לא נמצא',
    notFoundSub: 'הלינק הזה לא קיים או הוסר.',
    needsAccess: 'צריך גישה לחשבונות שלכם',
    forProject: 'עבור',
    secureNote: 'המידע שלכם מוצפן ומועבר בצורה מאובטחת',
    required: 'חובה',
    optional: 'אופציונלי',
    submit: 'שליחה מאובטחת',
    submitting: '...מצפין ושולח',
    success: '!נשלח בהצלחה',
    successSub: 'הפרטים שלכם הוצפנו והועברו בבטחה.',
    successClose: 'אפשר לסגור את הדף.',
    error: 'משהו השתבש. נסו שוב.',
    connectWith: 'התחברו עם',
    orEnterManually: 'או הזינו ידנית',
    stuck: 'אני צריך עזרה עם זה',
    copied: '!הועתק',
  },
};

export default function SubmissionPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('');
  const [data, setData] = useState<RequestData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'success' | 'error' | 'expired' | 'submitted' | 'revoked' | 'notfound'>('loading');
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/validate/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          const reason = json.reason || 'not_found';
          setStatus(reason === 'expired' ? 'expired' : reason === 'already_submitted' ? 'submitted' : reason === 'revoked' ? 'revoked' : 'notfound');
          return;
        }
        setData(json);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const lang = (data?.language === 'he' ? 'he' : 'en') as keyof typeof t;
  const strings = t[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const validateField = (field: Field, value: string): string | null => {
    if (field.required && !value.trim()) return strings.required;
    if (field.validationPattern && value.trim()) {
      try {
        if (!new RegExp(field.validationPattern).test(value.trim())) {
          return field.hint || 'Invalid format';
        }
      } catch { /* skip invalid regex */ }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!data) return;

    // Validate all fields
    const newErrors: Record<string, string> = {};
    for (const field of data.fields) {
      const err = validateField(field, values[field.id] || '');
      if (err) newErrors[field.id] = err;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(`/api/submit/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: values }),
      });

      if (!res.ok) {
        const json = await res.json();
        setErrorMsg(json.error || strings.error);
        setStatus('ready');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg(strings.error);
      setStatus('ready');
    }
  };

  // Status screens
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir={dir}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === 'expired' || status === 'submitted' || status === 'revoked' || status === 'notfound') {
    const messages = {
      expired: { title: strings.expired, sub: strings.expiredSub, icon: AlertCircle, color: 'text-amber-500' },
      submitted: { title: strings.submitted, sub: strings.submittedSub, icon: Check, color: 'text-green-500' },
      revoked: { title: strings.revoked, sub: strings.revokedSub, icon: AlertCircle, color: 'text-red-500' },
      notfound: { title: strings.notFound, sub: strings.notFoundSub, icon: AlertCircle, color: 'text-gray-500' },
    };
    const msg = messages[status];
    const Icon = msg.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={dir}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Icon className={`w-16 h-16 mx-auto mb-4 ${msg.color}`} />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{msg.title}</h1>
          <p className="text-gray-500">{msg.sub}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={dir}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{strings.success}</h1>
          <p className="text-gray-500 mb-2">{strings.successSub}</p>
          <p className="text-gray-400 text-sm">{strings.successClose}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Main submission form
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-8" dir={dir}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {data.developer.businessName || data.developer.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {strings.needsAccess}
              {data.projectName && (
                <span className="font-medium"> {strings.forProject} {data.projectName}</span>
              )}
            </p>
          </div>

          {data.note && (
            <div className="bg-blue-50 text-blue-800 text-sm rounded-lg p-3 mb-4">
              {data.note}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{strings.secureNote}</span>
          </div>
        </div>

        {/* OAuth Connect Buttons — Coming Soon */}
        {data.oauthConnections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="space-y-3">
              {data.oauthConnections.map((conn) => (
                <div key={conn.id} className="relative group">
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-3 bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-xl cursor-not-allowed"
                  >
                    {strings.connectWith} {conn.providerLabel}
                  </button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {lang === 'he' ? 'בקרוב' : 'Coming Soon'}
                  </span>
                </div>
              ))}
            </div>

            {data.fields.length > 0 && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-400">{strings.orEnterManually}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Fields */}
        {data.fields.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="space-y-4">
              {data.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {!field.required && (
                      <span className="text-gray-400 font-normal ms-1">({strings.optional})</span>
                    )}
                  </label>

                  <div className="relative">
                    <input
                      type={field.fieldType === 'SECRET' && !showSecrets[field.id] ? 'password' : 'text'}
                      value={values[field.id] || ''}
                      onChange={(e) => {
                        setValues({ ...values, [field.id]: e.target.value });
                        if (errors[field.id]) {
                          setErrors({ ...errors, [field.id]: '' });
                        }
                      }}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                        errors[field.id] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'
                      }`}
                      dir="ltr"
                      autoComplete="off"
                      spellCheck={false}
                    />

                    {field.fieldType === 'SECRET' && (
                      <button
                        type="button"
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setShowSecrets({ ...showSecrets, [field.id]: !showSecrets[field.id] })}
                        aria-label={showSecrets[field.id] ? 'Hide' : 'Show'}
                      >
                        {showSecrets[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {field.hint && !errors[field.id] && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {field.hint}
                    </p>
                  )}

                  {errors[field.id] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {strings.submitting}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              {strings.submit}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
