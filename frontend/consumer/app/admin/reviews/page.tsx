'use client'

import { Star } from 'lucide-react'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Review Management</h1>
        <p className="text-slate-500">Manage and view all reviews on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Review</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading reviews...</td></tr>}
              {!loading && reviews.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No reviews found.</td></tr>}
              {!loading && reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        <Star size={20} />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm block">{review.users?.full_name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                    {review.wineries?.name ? `Winery: ${review.wineries.name}` : review.wines?.name ? `Wine: ${review.wines.name}` : 'Unknown Entity'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20">
                      {review.rating || 0} / 5
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 max-w-xs truncate">
                    {review.comment || review.review_text || 'No text provided'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-600/80 font-semibold px-4 py-2 hover:bg-destructive/10 rounded-lg transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
