'use client'

import { Wine, Search, Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WinesPage() {
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchWines() {
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

  const filteredWines = wines.filter(w => 
    w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.wineries?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.wine_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6D071A] font-mono">
              Cellar & Inventory
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Bottled Wine Catalog
          </h1>
          <p className="text-[#888888] text-xs mt-1">
            Global repository of certified varietals, reserve vintages, and terroir classifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FDF2F4] text-[#6D071A] font-bold text-xs rounded-xl border border-[#6D071A]/20 flex items-center gap-2">
            <Award size={14} className="text-[#D4AF37]" />
            <span>{wines.length} Vintages Indexed</span>
          </span>
        </div>
      </div>

      {/* Search and summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search wine, vintage, or estate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#ECECEC] bg-white text-[#222222] focus:outline-none focus:border-[#6D071A] placeholder:text-[#888888]"
          />
        </div>

        <span className="text-xs text-[#888888]">
          Showing <strong className="text-[#222222]">{filteredWines.length}</strong> listings
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#FAF7F2]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Wine & Label
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Producing Estate
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Classification / Type
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Vintage
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]/60 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    <div className="inline-block w-6 h-6 border-2 border-[#6D071A] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Accessing wine reserve tables...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredWines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    <Wine size={32} className="mx-auto mb-2 text-[#888888] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No wines found</p>
                    <p className="text-xs mt-1">Check back once partner wineries upload their bottle portfolio.</p>
                  </td>
                </tr>
              )}

              {!loading && filteredWines.map((wine) => (
                <tr key={wine.id} className="hover:bg-[#F8F9FB] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center shrink-0">
                        <Wine size={18} />
                      </div>
                      <div>
                        <span className="font-semibold text-[#222222] text-sm font-serif block group-hover:text-[#6D071A] transition-colors">
                          {wine.name}
                        </span>
                        {wine.region && (
                          <span className="text-[11px] text-[#888888]">
                            {wine.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-medium">
                    {wine.wineries?.name || 'Independent Estate'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-[#FDF2F4] text-[#6D071A] border-[#6D071A]/20">
                      {wine.wine_type || 'Reserve Blend'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-mono">
                    {wine.vintage || 'NV'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button 
                      onClick={() => alert(`Vintage Dossier:\n\nWine: ${wine.name}\nEstate: ${wine.wineries?.name || 'N/A'}\nType: ${wine.wine_type || 'N/A'}\nVintage: ${wine.vintage || 'N/A'}\nPrice: ${wine.price ? '₹' + wine.price : 'Inquire'}`)}
                      className="text-[#6D071A] hover:text-[#841126] font-semibold px-3 py-1.5 hover:bg-[#FDF2F4] rounded-lg transition-colors border border-transparent hover:border-[#6D071A]/20 cursor-pointer"
                    >
                      Dossier
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
