import type { Metadata, Viewport } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { WishlistProvider } from '@/context/WishlistContext'
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
            <body className="bg-vino-dark text-vino-gray" suppressHydrationWarning>
                <WishlistProvider>
                    <Navbar user={user} />
                    <main className="overflow-x-hidden">
                        {children}
                    </main>
                </WishlistProvider>
            </body>
        </html>
    )
}
