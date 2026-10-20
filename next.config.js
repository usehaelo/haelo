/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow isolated verification while a development server is running.
  distDir: process.env.HAELO_DIST_DIR || '.next',
}

module.exports = nextConfig
