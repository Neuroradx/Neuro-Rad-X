"use strict";

// next.config.js
var nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};
module.exports = nextConfig;
