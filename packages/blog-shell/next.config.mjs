import { withContentlayer } from 'next-contentlayer2';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microservice-research/design-tokens'],
  
  // Multi-Zone: Keystatic admin is separate (port 5007)
  // Edit posts at: http://localhost:5007/keystatic
  // This zone (blog-shell) only displays blog posts
};

export default withNextIntl(withContentlayer(nextConfig));
