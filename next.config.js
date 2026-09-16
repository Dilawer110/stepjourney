/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/stepjourney',
  assetPrefix: '/stepjourney/',
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
