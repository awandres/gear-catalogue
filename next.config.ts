import type { NextConfig } from "next";
import { execSync } from 'child_process';

// Get git info at build time
function getGitInfo() {
  try {
    const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const gitMessage = execSync('git log -1 --pretty=%s').toString().trim();
    const gitDate = execSync('git log -1 --pretty=%ad --date=short').toString().trim();
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return { gitHash, gitMessage, gitDate, gitBranch };
  } catch (error) {
    console.warn('Unable to get git info:', error);
    return { gitHash: 'unknown', gitMessage: 'No git info', gitDate: 'unknown', gitBranch: 'unknown' };
  }
}

const gitInfo = getGitInfo();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_GIT_HASH: gitInfo.gitHash,
    NEXT_PUBLIC_GIT_MESSAGE: gitInfo.gitMessage,
    NEXT_PUBLIC_GIT_DATE: gitInfo.gitDate,
    NEXT_PUBLIC_GIT_BRANCH: gitInfo.gitBranch,
  },
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
      {
        protocol: 'https',
        hostname: 'www.proaudiodesign.com',
      },
      {
        protocol: 'https',
        hostname: '*.proaudiodesign.com',
      },
      // Additional audio equipment retailers
      {
        protocol: 'https',
        hostname: 'www.vintageking.com',
      },
      {
        protocol: 'https',
        hostname: '*.vintageking.com',
      },
      {
        protocol: 'https',
        hostname: 'www.soundonsound.com',
      },
      {
        protocol: 'https',
        hostname: '*.soundonsound.com',
      },
      // General image CDNs and services
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '*.shopifycdn.com',
      },
    ],
  },
};

export default nextConfig;
