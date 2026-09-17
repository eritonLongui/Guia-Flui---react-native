import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const adminDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: adminDir,
  },
  async redirects() {
    return [{ source: '/mapa', destination: '/', permanent: false }];
  },
};

export default nextConfig;
