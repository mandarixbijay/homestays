

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
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
  
};

export default nextConfig;