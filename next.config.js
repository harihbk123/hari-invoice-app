/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Experimental features from your current config
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },

  // Webpack configuration to handle Node.js modules in Edge Runtime
  webpack: (config, { nextRuntime }) => {
    // Only apply fallbacks for browser bundles, not for Edge Runtime
    if (typeof nextRuntime === "undefined") {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Supabase realtime-js related fallbacks
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
        querystring: false,
        punycode: false,
        url: false,
        buffer: false,
        events: false,
        tty: false,
        process: false
      };
    }

    // Externalize some packages to reduce bundle size
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },

  // Headers configuration for better security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Redirects for authentication
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'supabase-auth-token',
            value: undefined
          }
        ],
        destination: '/auth/login',
        permanent: false
      },
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'supabase-auth-token'
          }
        ],
        destination: '/dashboard',
        permanent: false
      }
    ];
  }
};

module.exports = nextConfig;
