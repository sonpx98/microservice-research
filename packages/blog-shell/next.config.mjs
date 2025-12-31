import { withContentlayer } from 'next-contentlayer2';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
};

export default withNextIntl(withContentlayer(nextConfig));
