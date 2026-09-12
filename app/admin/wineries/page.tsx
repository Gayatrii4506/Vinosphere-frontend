'use client'

import { Wine, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WineriesPage() {
  const [wineries, setWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWineries() {
      const { data, error } = await supabase
        .from('wineries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setWineries(data)
      setLoading(false)
    }

    fetchWineries()

    const channel = supabase.channel('winery_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wineries' }, () => fetchWineries())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Registered Wineries</h1>
          <p className="text-slate-500">Manage and monitor all wineries on the platform.</p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add Winery
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Winery Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading wineries...</td></tr>}
              {!loading && wineries.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No wineries found.</td></tr>}
              {!loading && wineries.map((winery) => (
                <tr key={winery.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                        <Wine size={20} />
                      </div>
                      <span className="font-semibold text-slate-900 text-base">{winery.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                    {winery.city ? `${winery.city}, ${winery.country}` : 'Location unknown'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border ${
                      winery.status?.toLowerCase() === 'approved' 
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                        : winery.status?.toLowerCase() === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
                    }`}>
                      {winery.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                    {new Date(winery.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 font-semibold px-4 py-2 hover:bg-accent rounded-lg transition-colors">
                      Edit
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
