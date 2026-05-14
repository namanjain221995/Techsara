/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  async headers() {
    const ONE_YEAR = "public, max-age=31536000, immutable";
    const ONE_WEEK = "public, max-age=604800, stale-while-revalidate=86400";
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: ONE_YEAR },
          // Hint browsers/CDNs that range requests are okay for the video.
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
      {
        source: "/logo/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/legacy/:path*",
        headers: [{ key: "Cache-Control", value: ONE_WEEK }],
      },
    ];
  },
};

export default nextConfig;
