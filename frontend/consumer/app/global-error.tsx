'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home, Wine } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('VinoSphere Global App Layout Error:', error)
    }, [error])

    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, backgroundColor: '#0D0407', fontFamily: 'serif, system-ui, sans-serif' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    boxSizing: 'border-box',
                    color: '#FAF5D3',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: '520px',
                        width: '100%',
                        backgroundColor: '#180A10',
                        border: '1px solid rgba(201, 170, 113, 0.35)',
                        borderRadius: '24px',
                        padding: '40px 32px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(139, 30, 63, 0.25)',
                            border: '1px solid rgba(201, 170, 113, 0.4)',
                            color: '#C9AA71',
                            marginBottom: '20px'
                        }}>
                            <Wine size={28} />
                        </div>

                        <div style={{
                            fontSize: '11px',
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            color: '#C9AA71',
                            fontFamily: 'monospace',
                            marginBottom: '12px'
                        }}>
                            Estate Resilience Guardian
                        </div>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            margin: '0 0 12px 0'
                        }}>
                            Application Restored to Baseline
                        </h1>

                        <p style={{
                            fontSize: '14px',
                            color: '#D4C5B9',
                            lineHeight: 1.6,
                            margin: '0 0 24px 0'
                        }}>
                            A global layout exception occurred. You can instantly reset the view or return to the main cellar catalog.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                type="button"
                                onClick={() => reset()}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#8B1E3F',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Re-initialize Page
                            </button>

                            <a
                                href="/"
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '9999px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#FAF5D3',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    textDecoration: 'none'
                                }}
                            >
                                Return to Home
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
