import { withContentlayer } from 'next-contentlayer2';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microservice-research/design-tokens'],
  
  // Multi-Zone: Rewrite /keystatic to keystatic-admin zone
  async rewrites() {
    return [
      {
        source: '/keystatic',
        destination: `${process.env.KEYSTATIC_ADMIN_URL || 'http://localhost:5007'}/keystatic`,
      },
      {
        source: '/keystatic/:path*',
        destination: `${process.env.KEYSTATIC_ADMIN_URL || 'http://localhost:5007'}/keystatic/:path*`,
      },
    ];
  },
};

export default withNextIntl(withContentlayer(nextConfig));
