import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 事例画像は Cloudinary から配信する。next/image は既定で自ドメインの
    // 画像しか通さないため、明示的に許可する。
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
