/** @type {import('next').NextConfig} */
const nextConfig = {
  // 嚴格模式
  reactStrictMode: true,

  // 實驗性功能
  experimental: {
    // Server Actions 已在 Next.js 14 中穩定
  },

  // 圖片優化設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
