import type { Metadata } from 'next'
import { WineriesClient } from './WineriesClient'

export const metadata: Metadata = {
    title: 'Wineries | VinoSphere',
    description:
        'Explore handpicked wineries from around the world, learn their stories, discover their signature wines, and plan unforgettable tasting experiences.',
}

export default function WineriesPage() {
    return <WineriesClient />
}
