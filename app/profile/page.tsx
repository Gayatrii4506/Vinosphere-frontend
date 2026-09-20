import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LuxuryUserProfile } from '@/components/profile/LuxuryUserProfile'
import { WINES } from '@/constants/wines'
import { isWineIdMatch } from '@/lib/utils/wine-id'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/welcome')
    }

    const metadata = user.user_metadata || {}
    const preferences = metadata.preferences || {}

    // 1. Fetch live user details & preferences from database table
    let dbUser: any = null
    try {
        const { data } = await supabase
            .from('users')
            .select('*')
            .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle()
        dbUser = data
    } catch {}

    // 2. Fetch real-time user wishlist IDs (direct table query without fragile FK joins)
    let wishlistRows: any[] = []
    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select('user_id, wine_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            wishlistRows = data
        }
    } catch {}

    // 3. Fetch real-time user bookings & experiences
    let bookingsData: any[] = []
    try {
        const { data } = await supabase
            .from('bookings')
            .select('*, winery_experiences(*)')
            .eq('user_id', user.id)
        bookingsData = data || []
    } catch {}

    // 4. Fetch real-time user interactions (views, likes, purchases)
    let interactionsData: any[] = []
    try {
        const { data } = await supabase
            .from('user_interactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        interactionsData = data || []
    } catch {
        // Fallback to legacy interactions table name if needed
        try {
            const { data } = await supabase
                .from('interactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)
            interactionsData = data || []
        } catch {}
    }

    // 5. Resolve Wishlist Wines
    const wishlistedWineIds = wishlistRows.map(r => String(r.wine_id)).filter(Boolean)
    const resolvedWishlist: any[] = []
    const missingDbIds: string[] = []

    wishlistedWineIds.forEach(id => {
        const found = WINES.find(w => isWineIdMatch(w.id, id))
        if (found) {
            resolvedWishlist.push({
                id: String(found.id),
                name: found.name,
                winery: found.origin || 'Nashik Valley',
                price: `₹${Number(found.price).toLocaleString()}`,
                image: found.imageUrl || '/bottle.png',
                type: found.type || 'Red'
            })
        } else {
            missingDbIds.push(id)
        }
    })

    // Fetch any custom winery-added wines from DB table
    if (missingDbIds.length > 0) {
        try {
            const { data: customWines } = await supabase
                .from('wines')
                .select('*, wineries(name, city, country), wine_inventory(price, stock_quantity), wine_images(image_url, is_primary)')
                .in('id', missingDbIds)

            if (customWines) {
                customWines.forEach((cw: any) => {
                    const inventory = Array.isArray(cw.wine_inventory) ? cw.wine_inventory[0] : cw.wine_inventory
                    const images = cw.wine_images || []
                    const primaryImage = images.find((img: any) => img.is_primary) || images[0]

                    resolvedWishlist.push({
                        id: String(cw.id),
                        name: cw.name,
                        winery: cw.wineries ? `${cw.wineries.city || ''}, ${cw.wineries.country || ''}`.replace(/^, /, '') : 'Nashik Valley',
                        price: inventory?.price ? `₹${Number(inventory.price).toLocaleString()}` : '₹1,200',
                        image: primaryImage?.image_url || '/bottle.png',
                        type: cw.wine_type || 'Red'
                    })
                })
            }
        } catch {}
    }

    // Compute real-time user metrics
    const distinctExploredWines = new Set(interactionsData.map((i: any) => i.wine_id).filter(Boolean))
    const distinctVisitedWineries = new Set(bookingsData.map((b: any) => b.winery_id || b.winery_experiences?.winery_id).filter(Boolean))

    const realMetrics = {
        winesExplored: Math.max(distinctExploredWines.size, interactionsData.length),
        winesSaved: wishlistRows.length,
        wineriesVisited: distinctVisitedWineries.size,
        experiences: bookingsData.length
    }

    // Format real experiences
    const realExperiences = bookingsData.map((b: any) => {
        const exp = b.winery_experiences || {}
        return {
            id: String(b.id),
            title: exp.title || b.experience_type || 'Winery Tasting',
            winery: exp.winery_name || b.winery_name || 'Artisanal Winery',
            date: b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Upcoming',
            image: exp.image_url || '/images/experience_bg.jpg'
        }
    })

    // Format real journey events
    const realJourney: Array<{ id: string; date: string; title: string; iconType: 'wishlist' | 'explored' | 'visited' | 'rated' }> = [];
    
    interactionsData.forEach((inter: any, idx: number) => {
        const formattedDate = inter.created_at ? new Date(inter.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
        const type = String(inter.interaction_type || '').toUpperCase()
        if (type === 'WISHLIST') {
            realJourney.push({
                id: `journey-w-${idx}`,
                date: formattedDate,
                title: `Saved bottle to wishlist`,
                iconType: 'wishlist'
            })
        } else if (type === 'PURCHASE') {
            realJourney.push({
                id: `journey-p-${idx}`,
                date: formattedDate,
                title: `Purchased estate bottle`,
                iconType: 'rated'
            })
        } else {
            realJourney.push({
                id: `journey-v-${idx}`,
                date: formattedDate,
                title: `Explored artisanal vintage`,
                iconType: 'explored'
            })
        }
    })

    const userProfileData = {
        id: user.id,
        email: user.email,
        name: dbUser?.full_name || metadata?.full_name || (user.email ? user.email.split('@')[0].replace(/[0-9]/g, '') : 'Wine Connoisseur'),
        phone: dbUser?.phone || metadata?.phone || '',
        city: dbUser?.city || metadata?.city || '',
        state: dbUser?.state || metadata?.state || '',
        country: dbUser?.country || metadata?.country || 'India',
        avatarUrl: metadata?.avatar_url,
        createdAt: user.created_at
    }

    const mergedPreferences = {
        experience_level: dbUser?.experience_level || preferences.experience_level || 'BEGINNER',
        favorite_types: dbUser?.favorite_wine_types || preferences.favorite_types || [],
        sweetness: dbUser?.preferred_sweetness || preferences.sweetness || '',
        body_style: dbUser?.preferred_body || preferences.body_style || '',
        flavors: dbUser?.preferred_flavors || preferences.flavors || [],
        grapes: dbUser?.preferred_grapes || preferences.grapes || [],
        budget_min: dbUser?.budget_min ?? preferences.budget_min,
        budget_max: dbUser?.budget_max ?? preferences.budget_max ?? 2500,
        taste_appealing: dbUser?.taste_appealing || preferences.taste_appealing || ''
    }

    return (
        <LuxuryUserProfile 
            user={userProfileData} 
            preferences={mergedPreferences} 
            metrics={realMetrics}
            wishlist={resolvedWishlist}
            experiences={realExperiences}
            journey={realJourney}
        />
    )
}
