import { API_V1_URL } from '@/lib/api-config'
import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineCatalog } from '@/components/catalog/WineCatalog'
import { Wine, WINES } from '@/constants/wines'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isWineIdMatch } from '@/lib/utils/wine-id'

export const metadata: Metadata = {
    title: 'My Cellar | VinoSphere',
    description: 'Your personal collection of saved wines.',
}

export const dynamic = 'force-dynamic';

async function getWishlist(): Promise<Wine[]> {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            redirect('/welcome?redirect=/cellar');
        }

        let rawItems: any[] = [];

        try {
            const res = await fetch(`${API_V1_URL}/wishlist`, {
                cache: 'no-store',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                rawItems = data.data || [];
            }
        } catch (fetchErr) {
            console.warn('Backend wishlist fetch failed in cellar, falling back to direct Supabase:', fetchErr);
        }

        // Direct Supabase fallback if backend returned nothing or failed
        if (rawItems.length === 0) {
            const { data: directData } = await supabase
                .from('wishlist')
                .select('user_id, wine_id, created_at, wines(*, wineries(name, city, country), wine_inventory(price, stock_quantity), wine_images(image_url, is_primary))')
                .eq('user_id', session.user.id);

            if (directData && directData.length > 0) {
                rawItems = directData;
            }
        }

        // Map the wishlist items to the frontend Wine interface
        return rawItems.map((item: any) => {
            const wine = item.wines;
            if (wine) {
                const inventory = Array.isArray(wine.wine_inventory) ? wine.wine_inventory[0] : wine.wine_inventory;
                const images = wine.wine_images || [];
                const primaryImage = images.find((img: any) => img.is_primary) || images[0];

                return {
                    id: wine.id,
                    name: wine.name,
                    origin: wine.wineries ? `${wine.wineries.city || ''}, ${wine.wineries.country || ''}`.replace(/^, /, '') : 'Unknown Origin',
                    volume: '0.75 L',
                    year: wine.vintage || new Date().getFullYear(),
                    rating: 90,
                    reviews: 12,
                    price: inventory?.price || 0,
                    currency: '₹',
                    imageUrl: primaryImage?.image_url || 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
                    type: wine.wine_type || 'Red',
                    sugar: 'Dry',
                    country: wine.wineries?.country || 'India',
                    manufacturer: wine.wineries?.name || 'Unknown Winery',
                    foodPairing: []
                };
            }

            // Fallback for static catalog demo wines
            const staticWine = WINES.find(w => isWineIdMatch(w.id, item.wine_id));
            if (staticWine) {
                return staticWine;
            }

            return null;
        }).filter(Boolean) as Wine[];
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return [];
    }
}

export default async function CellarPage() {
    const fetchedWines = await getWishlist();

    return (
        <Suspense fallback={
            <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                <div className="text-vino-dark/60 text-lg">Loading your cellar...</div>
            </div>
        }>
            {fetchedWines.length === 0 ? (
                <div className="bg-[#F8F5EF] min-h-screen pt-32 pb-24 flex flex-col items-center justify-center">
                    <h2 className="font-serif text-3xl font-bold text-vino-darker mb-4">Your Cellar is Empty</h2>
                    <p className="text-stone-500 max-w-md text-center">
                        You haven&apos;t added any wines to your wishlist yet. Head over to the catalog to discover new wines!
                    </p>
                </div>
            ) : (
                <WineCatalog initialWines={fetchedWines} />
            )}
        </Suspense>
    )
}
