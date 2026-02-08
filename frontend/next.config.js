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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.tawk.to challenges.cloudflare.com static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com *.tawk.to",
              "img-src 'self' data: blob: storage.googleapis.com res.cloudinary.com images.unsplash.com *.supabase.co",
              "font-src 'self' fonts.gstatic.com *.tawk.to",
              "media-src 'self' blob: *.supabase.co",
              "connect-src 'self' *.supabase.co wss://*.supabase.co *.paratika.com.tr *.tawk.to wss://*.tawk.to",
              "frame-src 'self' *.tawk.to challenges.cloudflare.com",
              "frame-ancestors 'none'"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
