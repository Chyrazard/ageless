import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["*.trycloudflare.com"],
  devIndicators: {
    position: "bottom-left",
  },
};

export default nextConfig;
