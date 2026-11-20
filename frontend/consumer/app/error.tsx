'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home, Wine, AlertCircle } from 'lucide-react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('VinoSphere Consumer Application Error Caught:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#0D0407] text-[#FAF5D3] flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Background Texture & Glow */}
            <div 
                aria-hidden="true" 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 35%, #8B1E3F 0%, transparent 60%)'
                }}
            />

            <div className="relative z-10 max-w-lg w-full bg-[#180A10]/90 backdrop-blur-md border border-[#8B1E3F]/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
                {/* Brand Badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8B1E3F]/20 border border-[#C9AA71]/40 text-[#C9AA71] mb-6 shadow-sm">
                    <Wine size={28} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[10px] tracking-[0.24em] uppercase font-bold text-[#C9AA71] font-mono">
                        Estate Concierge Notice
                    </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                    A Momentary Decanting Delay
                </h1>

                <p className="text-stone-300 text-sm leading-relaxed mb-6">
                    We encountered an unexpected vintage fluctuation while fetching this view. Your session and saved cellar remain safe.
                </p>

                {error?.digest && (
                    <div className="mb-6 p-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-400 font-mono text-[11px] truncate">
                        Reference Code: {error.digest}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#8B1E3F] hover:bg-[#A32349] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCcw size={15} />
                        Retry Loading
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-[#FAF5D3] font-semibold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={15} />
                        Back to Cellar Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
