/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // assetPrefix ensures all assets (JS, CSS) use absolute URLs
  // This is critical for multi-zone architecture where blog-shell
  // rewrites /keystatic to this domain
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_ASSET_PREFIX || 'https://microservice-research-keystatic-adm.vercel.app'
    : undefined,
};

export default nextConfig;
