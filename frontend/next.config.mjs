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

  async redirects() {
    return [
      // Canonical host: force the bare apex (non-www) to https://www, preserving the.
      // path. Second fallback behind Cloudflare's rule and the nginx redirect.
      {
        source: "/:path*",
        has: [{ type: "host", value: "techsarasolutions.com" }],
        destination: "https://www.techsarasolutions.com/:path*",
        permanent: true,
      },
      // Legacy /contact-us URL → the standalone contact page (permanent 308).
      { source: "/contact-us", destination: "/contact", permanent: true },
    ];
  },

  async headers() {
    const ONE_YEAR = "public, max-age=31536000, immutable";
    const ONE_WEEK = "public, max-age=604800, stale-while-revalidate=86400";
    const ONE_HOUR = "public, max-age=3600, stale-while-revalidate=86400";
    return [
      {
        // Sitewide security headers — HSTS in particular is a scored check in SEO
        // audits (SEO Site Checkup, Lighthouse best-practices).
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: ONE_HOUR },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "X-Robots-Tag", value: "index, follow" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: ONE_HOUR }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: ONE_HOUR }],
      },
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
        // Version-pinned vendor libs (lenis/gsap/ScrollTrigger) — safe to cache immutably.
        source: "/legacy/vendor/:path*",
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
