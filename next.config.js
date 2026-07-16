/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  // Set this to your GitHub repo name, e.g. "/home-finance-pro"
  // Leave as "" if deploying to a username.github.io root repo.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
};

module.exports = nextConfig;
