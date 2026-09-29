import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Run portal on port 3001 to avoid conflict with NestJS backend on 3000
  // Use: npm run dev -- -p 3001
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://localhost:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
