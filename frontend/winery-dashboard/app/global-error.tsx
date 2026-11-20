'use client'

import React, { useEffect } from 'react'

export default function WineryGlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Winery Dashboard Global Error:', error)
    }, [error])

    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, backgroundColor: '#F8F9FB', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #ECECEC', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222222', margin: '0 0 8px 0' }}>Winery Console Error</h2>
                        <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 20px 0' }}>An unexpected error occurred while rendering the portal.</p>
                        <button type="button" onClick={() => reset()} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#8B1E3F', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Reload Console
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
