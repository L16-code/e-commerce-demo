/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure that dynamic routes work properly
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
