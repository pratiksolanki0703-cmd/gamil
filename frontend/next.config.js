/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Static export for GitHub Pages
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,  // Better for GitHub Pages
}
module.exports = nextConfig
