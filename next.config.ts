import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Expõe o ambiente Vercel no client (production | preview | development).
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
  },
};

export default nextConfig;
