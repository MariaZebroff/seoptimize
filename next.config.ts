import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  }
};

export default nextConfig;
