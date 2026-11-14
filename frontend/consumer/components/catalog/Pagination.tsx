'use client'

import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    
    // For a real app with many pages, we would add ellipsis logic, but for this mock we'll show a few pages.
    const visiblePages = pages.slice(0, 5)

    return (
        <div className="flex items-center justify-center gap-4 mt-12 py-8 border-t border-vino-dark/10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-vino-darker hover:text-vino-accent disabled:opacity-50 disabled:hover:text-vino-darker transition-colors"
            >
                &larr; Prev
            </button>
            
            <div className="flex items-center gap-2">
                {visiblePages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            currentPage === page
                                ? 'bg-vino-accent text-white font-medium'
                                : 'text-vino-darker hover:bg-vino-cream-dark'
                        }`}
                    >
                        {page < 10 ? `0${page}` : page}
                    </button>
                ))}
                {totalPages > 5 && <span className="text-vino-dark/60">...</span>}
                {totalPages > 5 && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            currentPage === totalPages
                                ? 'bg-vino-accent text-white font-medium'
                                : 'text-vino-darker hover:bg-vino-cream-dark'
                        }`}
                    >
                        {totalPages < 10 ? `0${totalPages}` : totalPages}
                    </button>
                )}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-vino-darker hover:text-vino-accent disabled:opacity-50 disabled:hover:text-vino-darker transition-colors"
            >
                Next &rarr;
            </button>
        </div>
    )
}
