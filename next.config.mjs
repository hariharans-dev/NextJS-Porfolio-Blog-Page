/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com", // ✅ Added to allow loading skill icons
      },
    ],
  },
  redirects: async () => {
    return [];
  },
  reactStrictMode: true, // ✅ Good practice for Next.js development
  swcMinify: true, // ✅ Enable SWC minifier for better performance
};

export default nextConfig;
