import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '32mb',
    },
  },
  reactStrictMode: false,
  // Ensure clients always get fresh JS chunks after deployments
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
