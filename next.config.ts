import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow large PDF uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '32mb',
    },
  },
  // Disable strict mode for mermaid client-side rendering compatibility
  // Re-enable after confirming mermaid renders correctly in strict mode
  reactStrictMode: false,
};

export default nextConfig;
