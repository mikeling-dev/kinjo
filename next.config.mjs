/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["mruhiabovgatzamlgyrq.supabase.co"],
  },
  async headers() {
    reactStrictMode: false;
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
