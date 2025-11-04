import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'youtube.com',
      },
      {
        protocol: 'https',
        hostname: '*.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // Music equipment retailer domains
      {
        protocol: 'https',
        hostname: 'images.reverb.com',
      },
      {
        protocol: 'https',
        hostname: 'media.sweetwater.com',
      },
      {
        protocol: 'https',
        hostname: 'media.guitarcenter.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thomannmusic.com',
      },
      {
        protocol: 'https',
        hostname: 'andertons-productimages.s3.amazonaws.com',
      },
      // General image CDNs
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
