import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'refactored-succotash-5wqxqgg7pgph449x-3000.app.github.dev',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bvtbcwjthviauyrkusrk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
