import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — KeyDrop' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: March 2026</p>

        <h2>1. What We Collect</h2>
        <p>We collect only what is necessary to provide the service:</p>
        <ul>
          <li><strong>Account data:</strong> email address, name, and hashed password</li>
          <li><strong>Usage data:</strong> request counts, plan information, and audit logs</li>
          <li><strong>Credentials:</strong> encrypted with AES-256-GCM — we cannot read them</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To provide and maintain the KeyDrop service</li>
          <li>To process billing through LemonSqueezy</li>
          <li>To send service-related communications</li>
          <li>To maintain audit logs for security</li>
        </ul>

        <h2>3. Encryption</h2>
        <p>All credentials submitted through KeyDrop are encrypted with AES-256-GCM before being stored in the database. Encryption keys are managed server-side and never exposed to clients. We cannot decrypt or access your stored credentials without the master key.</p>

        <h2>4. Data Retention</h2>
        <ul>
          <li><strong>Active requests:</strong> stored until retrieved or expired</li>
          <li><strong>Expired/revoked requests:</strong> credential data is purged</li>
          <li><strong>Account data:</strong> retained while your account is active</li>
          <li><strong>Audit logs:</strong> retained for 90 days</li>
        </ul>

        <h2>5. Third Parties</h2>
        <p>We share data only with:</p>
        <ul>
          <li><strong>LemonSqueezy:</strong> payment processing (email, plan info)</li>
          <li><strong>Hosting provider:</strong> encrypted data at rest</li>
        </ul>
        <p>We do not sell your data. We do not use your data for advertising.</p>

        <h2>6. Your Rights</h2>
        <p>You may request deletion of your account and all associated data at any time by contacting us.</p>

        <h2>7. Contact</h2>
        <p>Privacy questions? Email <a href="mailto:royearguan@gmail.com">royearguan@gmail.com</a>.</p>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-blue-600 hover:text-blue-800 no-underline">&larr; Back to KeyDrop</Link>
        </div>
      </div>
    </div>
  );
}
