import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

// Photos are served from whichever Supabase project the app points at, so the
// allowed image host follows the environment instead of being hardcoded.
const supabaseHost = new URL(supabaseUrl).hostname;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Each Codespace gets its own hostname. Production is same origin and needs no list.
      allowedOrigins: isDevelopment ? ["localhost:3000", "*.app.github.dev"] : [],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;