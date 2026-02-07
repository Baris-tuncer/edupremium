/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'storage.googleapis.com', 'res.cloudinary.com', 'images.unsplash.com'],
  },
  async redirects() {
    return [
      {
        source: '/student',
        destination: '/student/dashboard',
        permanent: true,
      },
      {
        source: '/teacher',
        destination: '/teacher/dashboard',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: blob: storage.googleapis.com res.cloudinary.com images.unsplash.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' *.supabase.co wss://*.supabase.co *.paratika.com.tr",
              "frame-ancestors 'none'"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
