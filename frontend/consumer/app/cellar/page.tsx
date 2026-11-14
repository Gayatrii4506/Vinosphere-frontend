import React from 'react'
import { Metadata } from 'next'
import CellarView from '@/components/cellar/CellarView'

export const metadata: Metadata = {
    title: 'My Cellar | VinoSphere',
    description: 'Your personal collection of saved wines.',
}

export default function CellarPage() {
    return <CellarView />
}
