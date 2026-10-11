import type { NextConfig } from "next";

// Codespaces forward the app through a different host than the one Next.js
// sees, so Server Actions need that host trusted in development only.
const devOrigins = process.env.NODE_ENV === "development" ? ["*.app.github.dev"] : [];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", ...devOrigins],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bvtbcwjthviauyrkusrk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;