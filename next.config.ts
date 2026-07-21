import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["moving-hood-primary-allen.trycloudflare.com"],
  devIndicators: {
    position: "bottom-left",
  },
};

export default nextConfig;
