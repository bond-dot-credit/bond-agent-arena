/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ['d3', 'chart.js'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
};

export default nextConfig;
