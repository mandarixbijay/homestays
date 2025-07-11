import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Add this for static site generation
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
  webpack: (config: any) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;