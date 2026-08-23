import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineCatalog } from '@/components/catalog/WineCatalog'
import { Wine } from '@/constants/wines'

export const metadata: Metadata = {
    title: 'Wine Catalog | VinoSphere',
    description: 'Explore our premium selection of fine wines from around the world.',
}

// Ensure the page is dynamically rendered if we want live data
export const dynamic = 'force-dynamic';

async function getWines(): Promise<Wine[]> {
    try {
        const res = await fetch('http://localhost:5000/api/v1/discovery/wines', {
            // Next.js caching: adjust as needed, 'no-store' forces a fresh fetch
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            console.error('Failed to fetch wines from backend');
            return []; // Fallback to empty array
        }

        const data = await res.json();
        
        // Map the backend response to the frontend's expected Wine interface
        return data.data.map((wine: any) => ({
            id: wine.id,
            name: wine.name,
            // Assuming winery has city/state/country, create a friendly origin string
            origin: wine.winery ? `${wine.winery.city || ''}, ${wine.winery.country || ''}`.replace(/^, /, '') : 'Unknown Origin',
            volume: '0.75 L', // Defaulting as volume isn't in the schema yet
            year: wine.vintage || new Date().getFullYear(),
            rating: 0, // In a full app, this would be computed from reviews
            reviews: 0,
            price: wine.price || 0,
            currency: '₹', // Hardcoded to INR based on current constants
            imageUrl: wine.image_url || 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
            type: wine.wine_type || 'Red',
            sugar: 'Dry', // Defaulting
            country: wine.winery?.country || 'India',
            manufacturer: wine.winery?.name || 'Unknown Winery',
            foodPairing: [] // Would join food_pairings table in the future
        }));
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
