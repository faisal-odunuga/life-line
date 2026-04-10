/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure we can use Three.js and other client-side libs
  transpilePackages: ['three'],
};

export default nextConfig;
