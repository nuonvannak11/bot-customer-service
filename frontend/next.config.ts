import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "buckets.onecontrol.store",
      },
    ],
  },
};

export default nextConfig;
