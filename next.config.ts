import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : '**.supabase.co';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/**',
      },
    ],
  },
  ...(isVercel ? {} : { output: 'standalone' }),
};

export default nextConfig;
