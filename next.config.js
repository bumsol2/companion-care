/** @type {import('next').NextConfig} */

// 최소한의 설정만 유지하고 모든 실험적 기능 비활성화
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['hvcmjdbkbgbpsunldjmg.supabase.co'],
  },
  // 빌드 트레이스 수집 비활성화 - micromatch 무한 재귀 방지
  experimental: {
    // serverActions 제거
    // 트레이스 수집 비활성화
    outputFileTracingRoot: null,
    outputFileTracingExcludes: {
      '*': ['**/*'],
    },
  },
  // 타임아웃 증가
  staticPageGenerationTimeout: 180,
  // 헤더 단순화
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
