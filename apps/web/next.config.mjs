/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const targetUrl = process.env.ML_INFERENCE_SERVICE_URL || "http://localhost:8000";
    return [
      {
        source: "/api/py/:path*",
        destination: `${targetUrl}/api/v1/:path*`,
      },
      {
        source: "/api/py-health",
        destination: `${targetUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
