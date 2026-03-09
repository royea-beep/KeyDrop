'use client';

import { AuthProvider } from '@royea/shared-utils/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider storageKey="keydrop_auth" refreshEndpoint="/api/auth/refresh">
      {children as never}
    </AuthProvider>
  );
}
