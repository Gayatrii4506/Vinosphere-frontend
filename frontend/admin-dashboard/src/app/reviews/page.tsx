'use client'

import { Star, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          users(full_name),
          wineries(name),
          wines(name)
        `)
        .order('created_at', { ascending: false })
      
      if (data) setReviews(data)
      setLoading(false)
    }

    fetchReviews()

    const channel = supabase.channel('reviews_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => fetchReviews())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to moderate and remove this review?')) return
    try {
      await supabase.from('reviews').delete().eq('id', reviewId)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      alert('Failed to delete review')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Quality & Feedback
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Member Reviews & Sommelier Ratings
          </h1>
          <p className="text-[#71717A] text-sm mt-1">
            Evaluate tasting notes, vintage ratings, and visitor feedback across certified estates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FAF5D3] text-[#936F18] font-semibold text-xs rounded-xl border border-[#D4AF37]/30 flex items-center gap-2">
            <Star size={14} className="text-[#936F18] fill-[#936F18]" />
            <span>{reviews.length} Reviews Moderated</span>
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#F8F9FB]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Patron / Author
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Reviewed Entity
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Tasting Note / Commentary
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Moderation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]/70 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#71717A]">
                    <div className="inline-block w-6 h-6 border-2 border-[#6D071A] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Gathering community ratings...</p>
                  </td>
                </tr>
              )}

              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#71717A]">
                    <MessageSquare size={32} className="mx-auto mb-2 text-[#71717A] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No member reviews recorded</p>
                    <p className="text-xs mt-1 text-[#71717A]">Consumer reviews on wine bottles and winery visits will appear here.</p>
                  </td>
                </tr>
              )}

              {!loading && reviews.map((review) => {
                const rating = Number(review.rating) || 5
                return (
                  <tr key={review.id} className="hover:bg-[#F8F9FB] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF5D3] text-[#936F18] border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                          <Star size={18} className="fill-[#936F18]/30 text-[#936F18]" />
                        </div>
                        <span className="font-semibold text-[#222222] text-sm font-serif block group-hover:text-[#6D071A] transition-colors">
                          {review.users?.full_name || 'Connoisseur'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#71717A] text-xs font-medium">
                      {review.wineries?.name 
                        ? `Estate: ${review.wineries.name}` 
                        : review.wines?.name 
                        ? `Vintage: ${review.wines.name}` 
                        : 'Estate Wine'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5D3] border border-[#D4AF37]/25 text-[#936F18] font-bold text-xs">
                        <Star size={12} className="fill-[#936F18] text-[#936F18]" />
                        <span>{rating.toFixed(1)} / 5</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#71717A] text-xs max-w-sm truncate font-serif italic">
                      &ldquo;{review.review || review.comment || review.review_text || 'Exquisite balance and aroma.'}&rdquo;
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="text-[#EF4444] hover:text-[#DC2626] font-semibold px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
