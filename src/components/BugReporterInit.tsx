'use client';

import { useEffect } from 'react';
import { initBugReporter, destroyBugReporter } from '@/lib/bug-reporter';

export function BugReporterInit() {
  useEffect(() => {
    // KeyDrop uses Neon — send bug reports to shared Supabase
    const url = process.env.NEXT_PUBLIC_BUG_REPORTER_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_BUG_REPORTER_SUPABASE_KEY;
    if (!url || !key) return;

    initBugReporter({
      supabaseUrl: url,
      supabaseKey: key,
      projectName: 'keydrop',
      version: '1.0.0',
      position: 'bottom-left',
    });

    return () => destroyBugReporter();
  }, []);

  return null;
}
