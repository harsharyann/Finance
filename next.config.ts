import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Note: eslint config is handled via eslint.config.mjs in Next.js 16
};

export default nextConfig;
