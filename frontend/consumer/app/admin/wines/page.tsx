'use client'

import { Wine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WinesPage() {
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWines() {
      // Joining wineries table using Supabase relational query
      const { data } = await supabase
        .from('wines')
        .select(`
          *,
          wineries(name)
        `)
        .order('created_at', { ascending: false })
      
      if (data) setWines(data)
      setLoading(false)
    }

    fetchWines()

    const channel = supabase.channel('wines_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wines' }, () => fetchWines())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Wine Management</h1>
        <p className="text-slate-500">Manage and view all registered wines across wineries.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Wine Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Winery</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Vintage</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading wines...</td></tr>}
              {!loading && wines.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No wines found.</td></tr>}
              {!loading && wines.map((wine) => (
                <tr key={wine.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                        <Wine size={20} />
                      </div>
                      <span className="font-semibold text-slate-900 text-base">{wine.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                    {wine.wineries?.name || 'Unknown Winery'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20">
                      {wine.wine_type || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">{wine.vintage || 'N/A'}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 font-semibold px-4 py-2 hover:bg-accent rounded-lg transition-colors">
                      View
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
