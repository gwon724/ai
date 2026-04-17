import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 로고 이미지 최적화를 위한 허용 크기 추가
    imageSizes: [24, 32, 34, 36, 40, 56, 60, 72],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
