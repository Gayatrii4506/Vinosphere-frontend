'use client'

import { Wine, Search, Award, X, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WinesPage() {
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWine, setSelectedWine] = useState<any | null>(null)
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
                      onClick={() => setSelectedWine(wine)}
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

      {/* VINTAGE DOSSIER MODAL */}
      {selectedWine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-[#ECECEC] shadow-2xl space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
              <div className="flex items-center gap-2">
                <Wine className="w-5 h-5 text-[#6D071A]" />
                <h3 className="text-base font-bold font-serif text-[#222222]">Vintage Technical Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedWine(null)}
                className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition"
              >
                <X className="w-4 h-4 text-charcoal-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EDE5D8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Wine Name:</span>
                  <span className="font-bold text-[#222222]">{selectedWine.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Estate / Producer:</span>
                  <span className="font-semibold text-[#6D071A]">{selectedWine.wineries?.name || 'Independent Producer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Classification:</span>
                  <span className="font-bold text-[#222222]">{selectedWine.wine_type || 'Reserve'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Vintage Year:</span>
                  <span className="font-mono font-bold text-[#222222]">{selectedWine.vintage || 'NV'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Bottle Price:</span>
                  <span className="font-bold text-[#6D071A]">{selectedWine.price ? `₹${Number(selectedWine.price).toLocaleString()}` : 'Inquire / Cellar Door'}</span>
                </div>
                {selectedWine.region && (
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Terroir / Region:</span>
                    <span className="font-medium text-[#222222]">{selectedWine.region}</span>
                  </div>
                )}
              </div>

              {selectedWine.description && (
                <div className="p-3 bg-white rounded-xl border border-[#ECECEC]">
                  <span className="font-bold text-[#222222] block mb-1">Tasting Notes &amp; Profile</span>
                  <p className="text-stone-600 leading-relaxed">{selectedWine.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedWine(null)}
                className="px-4 py-2 border border-[#ECECEC] hover:bg-[#F8F9FB] text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
