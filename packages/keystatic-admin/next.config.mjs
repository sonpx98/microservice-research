/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Base path only for production (when deployed as /keystatic route)
  // In development, each zone has its own port, so basePath not needed
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/keystatic',
  }),
};

export default nextConfig;
