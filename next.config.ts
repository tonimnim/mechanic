import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true, // Recommended for catching potential issues
};

export default nextConfig;
