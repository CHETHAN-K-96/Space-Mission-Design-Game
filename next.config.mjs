/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/minecraft.html",
        destination: "/minecraft",
      },
      {
        source: "/showcase.html",
        destination: "/showcase",
      },
      {
        source: "/index.html",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
