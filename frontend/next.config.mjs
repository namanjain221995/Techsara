/** @type {import('next').NextConfig} */
const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/logo/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/legacy/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
    ];
  },
};

export default nextConfig;
