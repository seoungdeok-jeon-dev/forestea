import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  outputFileTracingIncludes: {
    "/**": ["../../packages/db/**/*", "./node_modules/@forestea/db/**/*"],
  },
};

export default nextConfig;