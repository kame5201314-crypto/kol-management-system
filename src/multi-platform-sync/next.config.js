/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.tw',
      },
      {
        protocol: 'https',
        hostname: '*.momo.com.tw',
      },
    ],
  },
}

module.exports = nextConfig
