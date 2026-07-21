import React from 'react'
import { Metadata } from 'next'
import { WineCatalog } from '@/components/catalog/WineCatalog'
import { WINES } from '@/constants/wines'

export const metadata: Metadata = {
    title: 'Wine Catalog | VinoSphere',
    description: 'Explore our premium selection of fine wines from around the world.',
}

export default function WinesPage() {
    return (
        <WineCatalog initialWines={WINES} />
    )
}
