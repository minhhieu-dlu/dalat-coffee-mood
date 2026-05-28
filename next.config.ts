import type { NextConfig } from "next";

// Detect Vercel environment so we can avoid `output: 'standalone'` there.
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  images: {
    // Allow Supabase storage images (generic pattern for *.supabase.co)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Keep `output: 'standalone'` for local/Docker builds, but omit on Vercel.
  ...(isVercel ? {} : { output: 'standalone' }),
};

export default nextConfig;
