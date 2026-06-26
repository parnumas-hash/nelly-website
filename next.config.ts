import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const supabaseRemotePatterns = [
  {
    protocol: "https" as const,
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
  ...(supabaseHostname &&
  !supabaseHostname.endsWith(".supabase.co")
    ? [
        {
          protocol: "https" as const,
          hostname: supabaseHostname,
          pathname: "/storage/v1/object/public/**",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseRemotePatterns),
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
