'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home, ShieldAlert } from 'lucide-react'

export default function AdminErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin Console Error Caught:', error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white border border-[#ECECEC] rounded-3xl p-8 shadow-xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6D071A]/10 text-[#6D071A] mb-4">
                    <ShieldAlert size={24} />
                </div>
                <h2 className="text-xl font-bold font-serif text-[#222222] mb-2">
                    Admin Platform Notice
                </h2>
                <p className="text-stone-500 text-sm mb-6">
                    A management view encountered an unexpected issue while retrieving records.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="px-5 py-2.5 rounded-xl bg-[#6D071A] hover:bg-[#841126] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                        <RotateCcw size={14} /> Retry View
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-[#F8F9FB] border border-[#ECECEC] text-[#222222] text-xs font-semibold flex items-center gap-2 hover:bg-stone-100 transition"
                    >
                        <Home size={14} /> Admin Overview
                    </Link>
                </div>
            </div>
        </div>
    )
}
