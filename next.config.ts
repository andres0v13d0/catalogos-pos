import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flystock-product-images.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [48, 96, 192, 384],
  },
};

export default nextConfig;
