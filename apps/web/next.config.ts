import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@horo/shared', '@horo/ui'],
  reactStrictMode: true,
  // Removed 'standalone' - use regular Next.js for simpler deployment
  experimental: {
    optimizePackageImports: ['@horo/ui'],
  },
};

export default nextConfig;
