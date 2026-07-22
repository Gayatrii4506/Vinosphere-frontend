import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineCatalog } from '@/components/catalog/WineCatalog'
import { WINES } from '@/constants/wines'

export const metadata: Metadata = {
    title: 'Wine Catalog | VinoSphere',
    description: 'Explore our premium selection of fine wines from around the world.',
}

export default function WinesPage() {
    return (
        <Suspense fallback={
            <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                <div className="text-vino-dark/60 text-lg">Loading catalog...</div>
            </div>
        }>
            <WineCatalog initialWines={WINES} />
        </Suspense>
    )
}
