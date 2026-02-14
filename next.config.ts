import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Skip linting and type checking during builds
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  // Suppress React 19 ref warnings from third-party libraries
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ndywoqepqadqmuravrap.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'uiwqtjaxvizfsaloseob.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Replace @mediapipe/selfie_segmentation with dummy module
      "@mediapipe/selfie_segmentation": "./lib/dummy-mediapipe.js",
      // Ignore the broken 100ms virtual background module
      "@100mslive/hms-virtual-background": "./lib/dummy-hms-virtual-background.js",
      // Ignore noise cancellation module (version conflicts)
      "@100mslive/hms-noise-cancellation": "./lib/dummy-hms-noise-cancellation.js",
    },
  },

  // Webpack configuration for dependency deduplication
  webpack: (config, { isServer }) => {
    if (!isServer) {
      try {
        // Ensure @tldraw/state is resolved to a single instance
        const tldrawStatePath = require.resolve("@tldraw/state", {
          paths: [process.cwd()],
        });
        config.resolve.alias = {
          ...config.resolve.alias,
          "@tldraw/state": tldrawStatePath,
        };
        // Also add to resolve.modules to ensure consistent resolution
        config.resolve.modules = [
          ...(config.resolve.modules || []),
          "node_modules",
        ];
      } catch (error) {
        // Package might not be installed or webpack might not be used (Turbopack)
        console.warn("Could not resolve @tldraw/state for webpack alias:", error);
      }
    }
    return config;
  },
};

export default nextConfig;
