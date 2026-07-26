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
        description: `${winery.tagline} — Visit ${winery.name} in ${winery.location}. Explore wines, estate experiences, tasting packages and more.`,
    }
}

export default async function WineryDetailPage({ params }: Props) {
    const { id } = await params
    const winery = WINERY_DETAILS[id]

    if (!winery) notFound()

    return (
        <>
            <WineryDetailClient winery={winery} />
            <NewsletterFooter />
        </>
    )
}
