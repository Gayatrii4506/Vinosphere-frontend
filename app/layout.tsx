import type { Metadata, Viewport } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import '@/styles/globals.css'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export const metadata: Metadata = {
    title: 'VinoSphere - Premium Wine Discovery Platform',
    description:
        'Discover, learn, and experience the world\'s finest wines with VinoSphere. Premium wine collections, expert tastings, and curated experiences.',
    keywords: [
        'wine discovery',
        'premium wines',
        'wine tastings',
        'wine regions',
        'wine learning',
        'luxury wine platform',
    ],
    authors: [{ name: 'VinoSphere' }],
    robots: 'index, follow',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="bg-vino-dark text-vino-gray">
                <Navbar />
                <main className="overflow-x-hidden">
                    {children}
                </main>
            </body>
        </html>
    )
}
