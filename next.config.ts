import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // experimental: { dynamicIO: true },
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
        {
          key: 'Content-Range',
          value: 'bytes : 0-9/*',
        },
      ],
    },
  ],

  images: {
    remotePatterns: [new URL('https://gateway.irys.xyz/**')],
  },

  /* config options here */
}

export default nextConfig
