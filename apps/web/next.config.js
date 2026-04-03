/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/auth', '@repo/db', '@repo/api', '@repo/validation', '@repo/cache'],
}

export default nextConfig
