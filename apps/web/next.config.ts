import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@forestea/db", "@forestea/menu"],
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/.pnpm/**/.prisma/client/**/*",
      "../../node_modules/.pnpm/**/.prisma/client/**/*",
    ],
  },
};

export default nextConfig;