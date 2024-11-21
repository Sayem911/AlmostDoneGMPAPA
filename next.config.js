/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', 
      'images.unsplash.com', 
      'lh3.googleusercontent.com'
    ],
  },
  experimental: {
    serverActions: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Configure output mode
  output: 'standalone',
  // Disable static optimization for API routes
  experimental: {
    serverActions: true,
    workerThreads: false,
    cpus: 1
  },
  // Force dynamic rendering for certain paths
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-middleware-cache',
            value: 'no-cache'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;