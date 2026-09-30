import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        qualities: [25, 50, 60, 70, 75, 80, 85, 88, 90, 95, 100],
        remotePatterns: [
            /**
              * Cloudinary CDN – all VinoSphere assets are served from here.
              */
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'encrypted-tbn0.gstatic.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.gstatic.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.ghost.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.ghost.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.ghost.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.depositphotos.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.pinimg.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.wp.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.wordpress.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.imgur.com',
                pathname: '/**',
            },
        ],
    },
    outputFileTracingRoot: __dirname,
}

export default nextConfig
