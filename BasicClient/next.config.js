/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'intphcm.com',
        },
        {
          protocol: 'https',
          hostname: '**.fbcdn.net',
        },
        {
          protocol: 'https',
          hostname: 'scontent.fhan5-3.fna.fbcdn.net',
        },
      ],
      // ✅ Disable optimization for external images that block hotlinking
      unoptimized: process.env.NODE_ENV === 'development',
      // ✅ Add dangerouslyAllowSVG if needed
      dangerouslyAllowSVG: true,
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
  }
  
  module.exports = nextConfig