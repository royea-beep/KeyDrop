import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@royea/shared-utils", "@royea/flush-queue"],
  turbopack: {
    resolveAlias: {
      "@royea/shared-utils/auth": "./node_modules/@royea/shared-utils/src/auth/index.ts",
      "@royea/shared-utils/auth-context": "./node_modules/@royea/shared-utils/src/auth-context.tsx",
      "@royea/shared-utils/auth-guard": "./node_modules/@royea/shared-utils/src/auth-guard.ts",
    },
  },
};

export default nextConfig;
