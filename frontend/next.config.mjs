/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for minimal Docker images: emits .next/standalone with the
  // exact node_modules subset needed at runtime.
  output: 'standalone',
};

export default nextConfig;
