/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },

  // 🖼️ Fix: Disable optimization temporarily to prevent 402 errors
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "nepalhomestays.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "s3-np1.datahub.com.np", pathname: "/homestay/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "homestays-s3.s3.eu-north-1.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudfront.net", pathname: "/**" },
      { protocol: "https", hostname: "cloudfront.net", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      "example.com",
      "images.unsplash.com",
      "picsum.photos",
      "homestays-s3.s3.eu-north-1.amazonaws.com",
    ],
  },

  // ✅ Fix: Properly rewrite API requests
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://13.61.8.56:3001/:path*",
      },
    ];
  },

  // ✅ Fix: Serve static assets properly (prevents 404 on /assets/*.js)
  assetPrefix: '',

  // ✅ Fix: Add Content Security Policy for analytics and external scripts
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.segment.com https://www.googletagmanager.com;
              connect-src 'self' https://cdn.segment.com https://www.google-analytics.com;
              img-src 'self' data: https:;
              style-src 'self' 'unsafe-inline';
              font-src 'self';
            `.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Skip static generation of error pages to work around Html import issue
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // ✅ Optional: Helps ensure static assets are bundled for production
  // output: 'standalone', // Temporarily disabled to debug Html import issue
};

export default nextConfig;
