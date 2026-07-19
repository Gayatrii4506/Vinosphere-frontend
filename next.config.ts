import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
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
        ],
    },
}

export default nextConfig
