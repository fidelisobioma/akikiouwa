import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all https image sources
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
