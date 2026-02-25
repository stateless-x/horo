import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@horo/shared', '@horo/ui'],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@horo/ui'],
  },
};

export default nextConfig;
