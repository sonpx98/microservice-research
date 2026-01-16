import { withContentlayer } from 'next-contentlayer2';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const supabaseUrl = process.env.NEXT_PUBLIC_COBROWSING_SUPABASE_URL?.replace('https://', '') || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microservice-research/design-tokens'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'genk.mediacdn.vn',
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to',
      },
      {
        protocol: 'https',
        hostname: 'topdev.vn',
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Monaco editor requires cdn.jsdelivr.net for loading scripts and workers
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "frame-src https://giscus.app",
              `connect-src 'self' https://giscus.app https://*.onrender.com http://127.0.0.1:3000 https://cdn.jsdelivr.net https://${supabaseUrl} wss://${supabaseUrl}`,
              // Monaco uses blob: URLs for web workers
              "worker-src 'self' blob: https://cdn.jsdelivr.net",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(withContentlayer(nextConfig));
