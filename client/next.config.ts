/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;