import Link from 'next/link';

export const metadata = { title: 'Terms of Service — KeyDrop' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: March 2026</p>

        <h2>1. Service</h2>
        <p>KeyDrop provides secure, encrypted credential collection through one-time links. By using the service, you agree to these terms.</p>

        <h2>2. Accounts</h2>
        <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account.</p>

        <h2>3. Acceptable Use</h2>
        <p>You may not use KeyDrop for any illegal purpose, to collect credentials without authorization, or to transmit malware or malicious content through credential links.</p>

        <h2>4. Data Handling</h2>
        <p>Credentials submitted through KeyDrop are encrypted with AES-256-GCM before storage. One-time links expire after use or after the configured expiry period. We do not access, read, or share your stored credentials.</p>

        <h2>5. Billing</h2>
        <p>Paid plans are billed monthly through our payment processor (LemonSqueezy). You may cancel at any time through the billing portal. Refunds are handled on a case-by-case basis.</p>

        <h2>6. Limitation of Liability</h2>
        <p>KeyDrop is provided &quot;as is&quot; without warranty. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

        <h2>7. Changes</h2>
        <p>We may update these terms from time to time. Continued use of KeyDrop after changes constitutes acceptance.</p>

        <h2>8. Contact</h2>
        <p>Questions about these terms? Email <a href="mailto:royearguan@gmail.com">royearguan@gmail.com</a>.</p>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-blue-600 hover:text-blue-800 no-underline">&larr; Back to KeyDrop</Link>
        </div>
      </div>
    </div>
  );
}
