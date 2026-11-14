import { API_V1_URL } from '@/lib/api-config'
import type { Metadata } from 'next'
import { WineriesClient } from './WineriesClient'

export const metadata: Metadata = {
    title: 'Wineries | VinoSphere',
    description:
        'Explore handpicked wineries from around the world, learn their stories, discover their signature wines, and plan unforgettable tasting experiences.',
}

export default async function WineriesPage() {
    let dbWineries = [];
    try {
        const res = await fetch(`${API_V1_URL}/wineries`, {
            next: { revalidate: 0 } // disable cache to show latest list
        });
        if (res.ok) {
            const json = await res.json();
            dbWineries = json.data || [];
        }
    } catch (err: any) {
        if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
            throw err;
        }
        // Fallback to client data when backend is not running during build or offline
    }

    return <WineriesClient dbWineries={dbWineries} />
}
