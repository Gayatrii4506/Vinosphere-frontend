import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineEventsCatalog } from '@/components/events/WineEventsCatalog'
import { EXPERIENCES } from '@/constants/events'

export const metadata: Metadata = {
    title: 'Wine Experiences & Masterclasses | VinoSphere',
    description: 'Discover and book exclusive grape harvest festivals, sommelier masterclasses, vineyard tours, and chef pairing dinners with VinoSphere.',
}

export default function EventsPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-vino-accent border-t-transparent rounded-full animate-spin" />
                        <div className="text-vino-dark/60 text-sm font-semibold tracking-wider uppercase">
                            Loading VinoSphere Experiences...
                        </div>
                    </div>
                </div>
            }
        >
            <WineEventsCatalog initialExperiences={EXPERIENCES} />
        </Suspense>
    )
}
