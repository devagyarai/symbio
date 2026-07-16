/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "utils", "types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
