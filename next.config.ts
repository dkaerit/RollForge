import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        'node:async_hooks': 'window async_hooks',
        'node:buffer': 'window buffer',
        'node:fs': 'window fs',
        'node:https': 'window https',
        'node:http': 'window http',
        'node:net': 'window net',
        'node:tls': 'window tls',
        'node:http2': 'window http2',
        'node:dns': 'window dns',
        'node:dgram': 'window dgram',
      });
    }
    return config; 
  },
};

export default nextConfig;
