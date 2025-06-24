import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'http://127.0.0.1:3030', 'http://localhost:3030', 'http://localhost:3333', 'http://127.0.0.1:3030'],
  transpilePackages: ['antd', '@ant-design/icons'],
};

export default nextConfig;
