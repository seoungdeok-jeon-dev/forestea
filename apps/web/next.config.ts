import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@forestea/db"],
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/.prisma/client/**/*",
      "../../node_modules/.prisma/client/**/*",
      "../../packages/db/node_modules/.prisma/client/**/*",
    ],
  },
};

export default nextConfig;