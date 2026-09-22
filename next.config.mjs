/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Produces a self-contained build (`.next/standalone`) used by the Docker
  // runtime image — see Dockerfile.
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
