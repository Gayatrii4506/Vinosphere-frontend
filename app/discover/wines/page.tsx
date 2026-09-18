import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineCatalog } from '@/components/catalog/WineCatalog'
import { Wine } from '@/constants/wines'
import { API_V1_URL } from '@/lib/api-config'

export const metadata: Metadata = {
    title: 'Wine Catalog | VinoSphere',
    description: 'Explore our premium selection of fine wines from around the world.',
}

// Ensure the page is dynamically rendered if we want live data
export const dynamic = 'force-dynamic';

async function getWines(): Promise<Wine[]> {
    try {
        const res = await fetch(`${API_V1_URL}/discovery/wines`, {
            // Next.js caching: adjust as needed, 'no-store' forces a fresh fetch
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            console.error('Failed to fetch wines from backend');
            return []; // Fallback to empty array
        }

        const data = await res.json();
        
        // Map the backend response to the frontend's expected Wine interface
                // Map the backend response to the frontend's expected Wine interface
        return data.data.map((wine: any) => {
            const wineType = wine.wine_type || 'Red';
            
            // Deterministic mock rating and review counts to prevent Next.js hydration mismatches
            const ratingValue = (wine.name.length % 5) * 5 + 80; // yields 80, 85, 90, 95, 100
            const reviewsCount = (wine.name.length % 10) * 3 + 5; // yields 5 to 32

            // Dynamic fallback image depending on the wine type
            let displayImageUrl = wine.image_url;
            if (!displayImageUrl) {
                const lowerType = wineType.toLowerCase();
                if (lowerType.includes('white')) {
                    displayImageUrl = 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=60';
                } else if (lowerType.includes('rose') || lowerType.includes('rosé')) {
                    displayImageUrl = 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=60';
                } else if (lowerType.includes('sparkling') || lowerType.includes('champagne')) {
                    displayImageUrl = 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=60';
                } else if (lowerType.includes('dessert')) {
                    displayImageUrl = 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=60';
                } else {
                    displayImageUrl = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=60';
                }
            }

            // Parse food pairings from comma-separated string or array
            const foodPairing = wine.food_pairings
                ? (typeof wine.food_pairings === 'string'
                    ? wine.food_pairings.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : Array.isArray(wine.food_pairings) ? wine.food_pairings : [])
                : [];

            // Parse taste notes from comma-separated string or array
            const tasteNotes = wine.taste_notes
                ? (typeof wine.taste_notes === 'string'
                    ? wine.taste_notes.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : Array.isArray(wine.taste_notes) ? wine.taste_notes : [])
                : [];

            return {
                id: wine.id,
                name: wine.name,
                origin: wine.winery ? `${wine.winery.city || ''}, ${wine.winery.country || ''}`.replace(/^, /, '') : 'Unknown Origin',
                volume: '0.75 L',
                year: wine.vintage || new Date().getFullYear(),
                rating: ratingValue,
                reviews: reviewsCount,
                price: wine.price || 0,
                currency: '₹',
                imageUrl: displayImageUrl,
                type: wineType,
                sugar: wine.sweetness || 'Dry',
                country: wine.winery?.country || 'India',
                manufacturer: wine.winery?.name || 'Unknown Winery',
                foodPairing: foodPairing,
                description: wine.description || '',
                tasteNotes: tasteNotes,
                alcoholPercentage: wine.alcohol_percentage || undefined,
                servingTemperature: wine.serving_temperature || undefined,
                body: wine.body || undefined,
                acidity: wine.acidity || undefined,
                tannin: wine.tannin || undefined,
                grapeVariety: wine.grape_variety || undefined
            };
        });
    } catch (error) {
        console.error('Error fetching wines:', error);
        return [];
    }
}

export default async function WinesPage() {
    const fetchedWines = await getWines();

    return (
        <Suspense fallback={
            <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                <div className="text-vino-dark/60 text-lg">Loading catalog...</div>
            </div>
        }>
            <WineCatalog initialWines={fetchedWines} />
        </Suspense>
    )
}
