'use client';

import { BugReporterButton } from './BugReporterModal';

export function BugReporterInit() {
  const url = process.env.NEXT_PUBLIC_BUG_REPORTER_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_BUG_REPORTER_SUPABASE_KEY;
  if (!url || !key) return null;

  return (
    <BugReporterButton options={{
      supabaseUrl: url,
      supabaseAnonKey: key,
      projectName: 'keydrop',
      appVersion: '1.0.0',
      githubRepo: 'royea-beep/KeyDrop',
      language: 'en',
    }} />
  );
}
