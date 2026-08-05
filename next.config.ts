import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "smpn1wanayasa.sch.id",
          },
        ],
        destination: "https://www.smpn1wanayasa.sch.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
