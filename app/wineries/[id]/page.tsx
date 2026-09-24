import { API_V1_URL } from '@/lib/api-config'
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
    if (winery) {
        return {
            title: `${winery.name} | Vinosphere`,
            description: `${winery.tagline} – Visit ${winery.name} in ${winery.location}. Explore wines, estate experiences, tasting packages and more.`,
        }
    }

    // Try fetching name from DB for metadata
    try {
        const res = await fetch(`${API_V1_URL}/wineries/${id}`, { next: { revalidate: 60 } })
        if (res.ok) {
            const json = await res.json()
            const dbW = json.data
            if (dbW) {
                return {
                    title: `${dbW.name} | Vinosphere`,
                    description: `${dbW.description || 'Visit ' + dbW.name}. Explore wines, estate experiences, and more.`,
                }
            }
        }
    } catch {
        // Fallback
    }

    return { title: 'Winery Details | Vinosphere' }
}

export default async function WineryDetailPage({ params }: Props) {
    const { id } = await params

    // 1. Fetch live winery details from the Express backend
    let dbWinery: any = null
    let dbWines: any[] = []
    let dbExperiences: any[] = []

    try {
        const res = await fetch(`${API_V1_URL}/wineries/${id}`, {
            next: { revalidate: 0 } // disable fetch cache to always show latest updates
        })
        if (res.ok) {
            const json = await res.json()
            dbWinery = json.data
        }
    } catch (err) {
        console.error("Error fetching live winery details:", err)
    }

    // 2. Fetch winery sub-resources (wines & experiences) if dbWinery exists
    if (dbWinery?.id) {
        try {
            const [winesRes, expRes] = await Promise.allSettled([
                fetch(`${API_V1_URL}/wines`, { next: { revalidate: 0 } }),
                fetch(`${API_V1_URL}/experiences`, { next: { revalidate: 0 } })
            ])
            if (winesRes.status === 'fulfilled' && winesRes.value.ok) {
                const winesJson = await winesRes.value.json()
                const rawList = Array.isArray(winesJson.data)
                    ? winesJson.data
                    : (winesJson.data?.wines || [])
                const normalized = rawList.map((item: any) => item.wine ? { ...item.wine, ...item } : item)
                dbWines = normalized.filter((w: any) => w.winery_id === dbWinery.id)
            }
            if (dbWines.length === 0) {
                try {
                    const discRes = await fetch(`${API_V1_URL}/discovery/wines`, { next: { revalidate: 0 } })
                    if (discRes.ok) {
                        const discJson = await discRes.json()
                        const discList = discJson.data || []
                        dbWines = discList.filter((w: any) => 
                            w.winery_id === dbWinery.id || 
                            w.winery?.name?.toLowerCase() === dbWinery.name?.toLowerCase()
                        )
                    }
                } catch {
                    // Fallback
                }
            }
            if (expRes.status === 'fulfilled' && expRes.value.ok) {
                const expJson = await expRes.value.json()
                const allExp = expJson.data || []
                dbExperiences = allExp.filter((e: any) => e.winery_id === dbWinery.id)
            }
        } catch (err) {
            console.error("Error fetching winery sub-resources:", err)
        }
    }

    const staticWinery = WINERY_DETAILS[id]
    
    // Fallback if neither exists
    if (!staticWinery && !dbWinery) notFound()

    const wineryName = dbWinery?.name || staticWinery?.name || 'Artisanal Estate'
    const wineryCity = dbWinery?.city || (staticWinery?.location ? staticWinery.location.split(',')[0] : 'Nashik')

    // 3. Merge static mock listings with database records and provide safe defaults
    const mergedWinery = {
        ...(staticWinery || {}),
        id: dbWinery?.id || staticWinery?.id || id,
        name: wineryName,
        tagline: dbWinery?.description || staticWinery?.tagline || 'Crafting exceptional wines with passion and terroir mastery.',
        established: dbWinery?.established_year || dbWinery?.established || staticWinery?.established || 2021,
        location: dbWinery?.city ? `${dbWinery.city}, ${dbWinery.state || 'India'}` : (staticWinery?.location || 'Nashik, Maharashtra, India'),
        region: dbWinery?.state || staticWinery?.region || 'Maharashtra',
        heroImage: dbWinery?.banner_url || staticWinery?.heroImage || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80',
        logo: dbWinery?.logo_url || staticWinery?.logo || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&q=80',
        timings: dbWinery?.timings || staticWinery?.timings || 'Mon - Sun: 10:30 AM - 6:30 PM',
        phone: dbWinery?.phone || staticWinery?.phone || '+91 253 234 5678',
        email: dbWinery?.email || staticWinery?.email || 'hospitality@vinosphere.com',
        website: dbWinery?.website || staticWinery?.website || '',
        coordinates: dbWinery?.latitude ? { lat: Number(dbWinery.latitude), lng: Number(dbWinery.longitude) } : ((staticWinery as any)?.coordinates || null),

        awards: dbWinery?.awards && dbWinery.awards.length > 0
            ? dbWinery.awards
            : (staticWinery?.awards || [
                { year: '2023', title: 'Estate Excellence Award', competition: 'India Wine Awards', medal: 'Gold' as const },
                { year: '2022', title: 'Best Terroir Expression', competition: 'Sommelier Guild Awards', medal: 'Double Gold' as const }
            ]),

        storyTimeline: dbWinery?.timeline && dbWinery.timeline.length > 0
            ? dbWinery.timeline
            : (staticWinery?.storyTimeline || [
                {
                    year: String(dbWinery?.established_year || 2021),
                    title: 'A Vision Takes Shape',
                    text: dbWinery?.description || 'Founded with a dedication to sustainable viticulture and artisanal winemaking in the heart of wine country.',
                    image: dbWinery?.banner_url || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80'
                }
            ]),

        estateExperiences: dbExperiences.length > 0
            ? dbExperiences.map((e: any, idx: number) => ({
                title: e.title,
                description: e.description || 'Immersive tasting and tour experience across our estate.',
                image: e.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
                align: (idx % 2 === 0 ? 'right' : 'left') as 'right' | 'left'
            }))
            : (staticWinery?.estateExperiences || [
                {
                    title: 'Vineyard Walk & Terroir Immersion',
                    description: 'Stroll through picturesque vine rows and learn how our microclimate and rich soil shape every harvest.',
                    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
                    align: 'right' as const
                },
                {
                    title: 'Barrel Cellar Tasting Experience',
                    description: 'Enter our underground oak aging cellars and taste selected vintages straight from the winemaker’s collection.',
                    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
                    align: 'left' as const
                }
            ]),

        signatureWines: dbWines.length > 0
            ? dbWines.map((w: any) => ({
                id: w.id,
                name: w.name,
                type: w.wine_type || 'Red Wine',
                vintage: w.vintage || 2022,
                rating: 92,
                price: Number(w.wine_inventory?.[0]?.price) || Number(w.price) || 1250,
                currency: '₹',
                image: w.wine_images?.[0]?.image_url || w.image_url || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80',
                notes: w.description || w.taste_notes || 'Elegant balance of fruit purity, gentle oak integration, and a persistent finish.',
                grapes: w.grape_variety || 'Estate Blend',
                region: `${wineryCity} Valley`
            }))
            : (staticWinery?.signatureWines || [
                {
                    id: 'sig-1',
                    name: `${wineryName} Reserve Shiraz`,
                    type: 'Red Wine',
                    vintage: 2022,
                    rating: 93,
                    price: 1450,
                    currency: '₹',
                    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80',
                    notes: 'Rich blackberry and plum aromas layered with subtle French oak vanilla and peppery spice.',
                    grapes: 'Shiraz & Cabernet',
                    region: `${wineryCity} Valley`
                },
                {
                    id: 'sig-2',
                    name: `${wineryName} Crisp Blanc`,
                    type: 'White Wine',
                    vintage: 2023,
                    rating: 91,
                    price: 1150,
                    currency: '₹',
                    image: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&q=80',
                    notes: 'Vibrant citrus blossoms, crisp green orchard fruits, and a refreshing mineral finish.',
                    grapes: 'Chenin Blanc',
                    region: `${wineryCity} Valley`
                }
            ]),

        packages: dbExperiences.length > 0
            ? dbExperiences.map((e: any, idx: number) => ({
                id: e.id,
                name: e.title,
                duration: `${e.duration_minutes || 60} mins`,
                price: Number(e.price) || 800,
                currency: '₹',
                includes: ['Estate vineyard tour', 'Guided wine tasting', 'Sommelier Q&A'],
                highlight: idx === 0
            }))
            : (staticWinery?.packages || [
                {
                    id: 'pkg-1',
                    name: 'Estate Discovery Tasting',
                    duration: '60 mins',
                    price: 750,
                    currency: '₹',
                    includes: ['Guided vineyard stroll', 'Tasting of 4 signature wines', 'Artisan bread & cheese accompaniments'],
                    highlight: true
                },
                {
                    id: 'pkg-2',
                    name: 'Winemaker Reserve Masterclass',
                    duration: '90 mins',
                    price: 1500,
                    currency: '₹',
                    includes: ['Private barrel cellar entry', 'Tasting of 6 reserve vintages', 'Sommelier pairings & tasting guide'],
                    highlight: false
                }
            ]),

        gallery: staticWinery?.gallery || [
            { src: dbWinery?.banner_url || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80', alt: 'Vineyard vista', span: 'wide' as const },
            { src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80', alt: 'Cellar barrels', span: 'normal' as const },
            { src: 'https://images.unsplash.com/photo-1543418219-44e30b057fc5?w=800&q=80', alt: 'Tasting room', span: 'tall' as const },
            { src: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80', alt: 'Grape harvest', span: 'normal' as const }
        ],

        reviews: staticWinery?.reviews || [
            {
                id: 'rev-1',
                author: 'Vikram Mehta',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
                rating: 5,
                date: 'October 2023',
                text: 'An exquisite experience from start to finish. The vineyard ambiance, passionate hosts, and outstanding wine collection made this unforgettable.',
                visit: 'Weekend Tasting'
            },
            {
                id: 'rev-2',
                author: 'Ananya Sharma',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
                rating: 5,
                date: 'December 2023',
                text: 'One of the most scenic wine estates I have visited. The reserve wines were sensational and the cellar tour was deeply informative.',
                visit: 'Private Tour'
            }
        ],

        relatedWineries: staticWinery?.relatedWineries || [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.8 },
            { id: 'york', name: 'York Winery', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/york_winery_tasting_room_1_sylvqa.jpg', rating: 4.6 }
        ]
    }

    return (
        <>
            <WineryDetailClient winery={mergedWinery as any} />
            <NewsletterFooter />
        </>
    )
}
