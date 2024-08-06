/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "https://storage.googleapis.com",
      "storage.googleapis.com",
      "https://storage.googleapis.com/",
    ],
  },
};

module.exports = nextConfig;
