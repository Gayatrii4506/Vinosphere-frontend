'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Heart, Wine as WineIcon, Sparkles, ArrowRight, Loader2, PackageOpen, Filter } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { Wine, WINES } from '@/constants/wines'
import { createClient } from '@/lib/supabase/client'
import { isWineIdMatch } from '@/lib/utils/wine-id'
import { WineCatalog } from '@/components/catalog/WineCatalog'

export default function CellarView() {
    const { wishlistIds, isLoading: isWishlistLoading } = useWishlist()
    const [dbWines, setDbWines] = useState<Wine[]>([])
    const [isFetchingDb, setIsFetchingDb] = useState(false)

    // 1. Fetch any custom database wines that match the wishlistIds
    useEffect(() => {
        if (wishlistIds.length === 0) {
            setDbWines([])
            return
        }

        const fetchDbWines = async () => {
            setIsFetchingDb(true)
            try {
                const supabase = createClient()
                
                // Fetch direct wine records for wishlisted IDs
                const { data, error } = await supabase
                    .from('wines')
                    .select('*, wineries(name, city, country), wine_inventory(price, stock_quantity), wine_images(image_url, is_primary)')
                    .in('id', wishlistIds)

                if (!error && data && data.length > 0) {
                    const mapped: Wine[] = data.map((wine: any) => {
                        const inventory = Array.isArray(wine.wine_inventory) ? wine.wine_inventory[0] : wine.wine_inventory
                        const images = wine.wine_images || []
                        const primaryImage = images.find((img: any) => img.is_primary) || images[0]

                        return {
                            id: wine.id,
                            name: wine.name,
                            origin: wine.wineries ? `${wine.wineries.city || ''}, ${wine.wineries.country || ''}`.replace(/^, /, '') : 'Nashik Valley',
                            volume: '0.75 L',
                            year: wine.vintage || new Date().getFullYear(),
                            rating: 90,
                            reviews: 12,
                            price: inventory?.price || 1200,
                            currency: '₹',
                            imageUrl: primaryImage?.image_url || '/bottle.png',
                            type: wine.wine_type || 'Red',
                            sugar: 'Dry',
                            country: wine.wineries?.country || 'India',
                            manufacturer: wine.wineries?.name || 'Artisanal Estate',
                            foodPairing: []
                        }
                    })
                    setDbWines(mapped)
                }
            } catch (err) {
                console.warn('Cellar DB fetch notice:', err)
            } finally {
                setIsFetchingDb(false)
            }
        }

        fetchDbWines()
    }, [wishlistIds])

    // 2. Resolve wishlisted wines across static catalog + fetched database wines
    const cellarWines = useMemo(() => {
        if (wishlistIds.length === 0) return []

        const result: Wine[] = []
        const seen = new Set<string>()

        // Look in static demo catalog
        wishlistIds.forEach(id => {
            const staticMatch = WINES.find(w => isWineIdMatch(w.id, id))
            if (staticMatch && !seen.has(String(staticMatch.id))) {
                seen.add(String(staticMatch.id))
                result.push(staticMatch)
            }
        })

        // Look in DB fetched wines
        dbWines.forEach(w => {
            if (!seen.has(String(w.id))) {
                seen.add(String(w.id))
                result.push(w)
            }
        })

        return result
    }, [wishlistIds, dbWines])

    if (isWishlistLoading) {
        return (
            <div className="bg-[#F8F5EF] min-h-screen pt-36 pb-24 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-vino-accent animate-spin mb-3" />
                <p className="text-stone-600 font-serif text-lg">Opening your private cellar...</p>
            </div>
        )
    }

    if (wishlistIds.length === 0 || cellarWines.length === 0) {
        return (
            <div className="bg-[#F8F5EF] min-h-screen pt-36 pb-24 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-500 mb-4">
                    <PackageOpen size={30} />
                </div>
                <h2 className="font-serif text-3xl font-bold text-vino-darker mb-2 text-center">Your Cellar is Empty</h2>
                <p className="text-stone-500 max-w-md text-center text-sm mb-6">
                    Save bottles from the wine catalog to build your personal tasting cellar, track vintages, and curate culinary pairings.
                </p>
                <Link
                    href="/discover/wines"
                    className="px-6 py-3 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
                >
                    <Sparkles size={16} />
                    Browse Wine Catalog &rarr;
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-[#F8F5EF] min-h-screen">
            {/* Cellar Header Banner */}
            <div className="bg-[#181215] text-white pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                                <Heart size={12} className="fill-rose-300" />
                                Personal Wine Cellar
                            </span>
                        </div>
                        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            My Saved Collection
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">
                            {cellarWines.length} {cellarWines.length === 1 ? 'bottle' : 'bottles'} saved to your palate collection
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/discover/wines"
                            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                            + Browse More Bottles
                        </Link>
                        <Link
                            href="/profile"
                            className="px-5 py-2.5 rounded-full bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-semibold transition-all shadow-sm"
                        >
                            View Taste Profile &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cellar Wine Grid */}
            <WineCatalog initialWines={cellarWines} hideHeaderBanner={true} />
        </div>
    )
}
