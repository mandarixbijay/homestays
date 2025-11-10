/** @type {import('next').NextConfig} */
const nextConfig = {

   api: {
    bodyParser: {
      sizeLimit: '20mb', // default is 1mb
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "nepalhomestays.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "s3-np1.datahub.com.np", pathname: "/homestay/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "homestays-s3.s3.eu-north-1.amazonaws.com", pathname: "/**" },
      
      // Add these for blog images and API development
      { protocol: "https", hostname: "example.com", pathname: "/**" }, // For API mock data
      { protocol: "http", hostname: "13.61.8.56", port: "3001", pathname: "/**" }, // Your API server
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" }, // Lorem Picsum for placeholders
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" }, // Unsplash source
      
      // Add more domains as needed for your blog images
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" }, // AWS S3 wildcard
      { protocol: "https", hostname: "cloudfront.net", pathname: "/**" }, // CloudFront
      { protocol: "https", hostname: "*.cloudfront.net", pathname: "/**" }, // CloudFront wildcard
    ],
    
    // Increase limits for blog images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Add domains for legacy support (if needed)
    domains: ["example.com", "images.unsplash.com", "picsum.photos"],
  },

  async rewrites() {
    return [
      // Proxy all API requests to your backend server
      {
        source: "/api/backend/:path*",
        destination: "http://13.61.8.56:3001/:path*",
      },
    ];
  },
  
  // Add experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;