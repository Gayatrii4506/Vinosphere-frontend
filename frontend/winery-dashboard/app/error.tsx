'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home, Building2 } from 'lucide-react'

export default function WineryErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Winery Dashboard Error Caught:', error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white border border-[#ECECEC] rounded-3xl p-8 shadow-xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F] mb-4">
                    <Building2 size={24} />
                </div>
                <h2 className="text-xl font-bold font-serif text-[#222222] mb-2">
                    Winery Portal Notice
                </h2>
                <p className="text-stone-500 text-sm mb-6">
                    A dashboard component encountered an issue loading real-time vineyard data.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs font-semibold flex items-center gap-2 transition"
                    >
                        <RotateCcw size={14} /> Retry
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-[#F8F9FB] border border-[#ECECEC] text-[#222222] text-xs font-semibold flex items-center gap-2 hover:bg-stone-100 transition"
                    >
                        <Home size={14} /> Dashboard Overview
                    </Link>
                </div>
            </div>
        </div>
    )
}
