// next.config.ts
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  output: 'standalone', // For serverless/SSR deployment on Vercel
  metadataBase: new URL('https://nepalhomestays.com'), // Add for correct Open Graph URLs
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "nepalhomestays.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "s3-np1.datahub.com.np", pathname: "/homestay/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "homestays-s3.s3.eu-north-1.amazonaws.com", pathname: "/**" },
    ],
  },
  webpack: (config: import('webpack').Configuration) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;