import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@forestea/db"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@forestea/db/**/*"],
  },
};

export default nextConfig;