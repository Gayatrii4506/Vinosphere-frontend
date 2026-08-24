import { notFound } from 'next/navigation'
import { WINERY_DETAILS } from '@/constants/winery-details'
import { WineryDetailClient } from '@/components/wineries/WineryDetailClient'
import { NewsletterFooter } from '@/components/home/NewsletterFooter'
import type { Metadata } from 'next'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateStaticParams() {
    return Object.keys(WINERY_DETAILS).map((id) => ({ id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const winery = WINERY_DETAILS[id]
    if (!winery) return { title: 'Winery Not Found' }
    return {
        title: `${winery.name} | Vinosphere`,
        description: `${winery.tagline} – Visit ${winery.name} in ${winery.location}. Explore wines, estate experiences, tasting packages and more.`,
    }
}

export default async function WineryDetailPage({ params }: Props) {
    const { id } = await params

    // 1. Fetch live winery details from the Express backend
    let dbWinery = null;
    try {
        const res = await fetch(`http://localhost:5000/api/v1/wineries/${id}`, {
            next: { revalidate: 0 } // disable fetch cache to always show latest updates
        });
        if (res.ok) {
            const json = await res.json();
            dbWinery = json.data;
        }
    } catch (err) {
        console.error("Error fetching live winery details:", err);
    }

    const staticWinery = WINERY_DETAILS[id];
    
    // Fallback if neither exists
    if (!staticWinery && !dbWinery) notFound();

    // 2. Merge static mock listings with database edits
    const mergedWinery = {
        ...(staticWinery || {}),
        id: dbWinery?.id || staticWinery?.id || id,
        name: dbWinery?.name || staticWinery?.name || 'Unnamed Winery',
        tagline: dbWinery?.description || staticWinery?.tagline || '',
        heroImage: dbWinery?.banner_url || staticWinery?.heroImage || '',
        logo: dbWinery?.logo_url || staticWinery?.logo || '',
        location: dbWinery?.city ? `${dbWinery.city}, ${dbWinery.state || ''}` : (staticWinery?.location || ''),
        region: dbWinery?.state || staticWinery?.region || '',
        coordinates: dbWinery?.latitude ? { lat: Number(dbWinery.latitude), lng: Number(dbWinery.longitude) } : (staticWinery?.coordinates || null),
        awards: dbWinery?.awards && dbWinery.awards.length > 0 ? dbWinery.awards : (staticWinery?.awards || []),
        storyTimeline: dbWinery?.timeline && dbWinery.timeline.length > 0 ? dbWinery.timeline : (staticWinery?.storyTimeline || [])
    };

    return (
        <>
            <WineryDetailClient winery={mergedWinery as any} />
            <NewsletterFooter />
        </>
    )
}
