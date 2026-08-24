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
        const res = await fetch('http://localhost:5000/api/v1/wineries', {
            next: { revalidate: 0 } // disable cache to show latest list
        });
        if (res.ok) {
            const json = await res.json();
            dbWineries = json.data || [];
        }
    } catch (err) {
        console.error("Error fetching database wineries list:", err);
    }

    return <WineriesClient dbWineries={dbWineries} />
}
