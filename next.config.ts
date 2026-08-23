import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        qualities: [25, 50, 60, 70, 75, 80, 85, 88, 90, 95, 100],
        remotePatterns: [
            /**
             * Cloudinary CDN – all VinoSphere assets are served from here.
             * Cloud name: xfklkvdc
             */
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/xfklkvdc/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/**',
            },
        ],
    },
    outputFileTracingRoot: __dirname,
}

export default nextConfig
