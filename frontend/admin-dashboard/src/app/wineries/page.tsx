'use client'

import { Wine, Plus, MapPin, CheckCircle2, Clock, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WineriesPage() {
  const [wineries, setWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredWineries = wineries.filter(w => 
    w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.state?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Partner Directory
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Registered Wineries & Estates
          </h1>
          <p className="text-[#888888] text-xs mt-1">
            Monitor, inspect, and manage verified estate partners across domestic and international terroirs.
          </p>
        </div>

        <button 
          onClick={() => alert('New winery registration can be initiated via the public Winery Onboarding Portal.')}
          className="bg-[#6D071A] hover:bg-[#841126] text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto text-xs"
        >
          <Plus size={16} className="text-[#FAF5D3]" />
          <span>Register Estate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by estate or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#ECECEC] bg-white text-[#222222] focus:outline-none focus:border-[#6D071A] placeholder:text-[#888888]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <span>Showing <strong className="text-[#222222]">{filteredWineries.length}</strong> of {wineries.length} estates</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#FAF7F2]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Estate Name
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Terroir / Location
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Verification Status
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Date Joined
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
                    <p className="text-xs">Loading registered estates...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredWineries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    <Wine size={32} className="mx-auto mb-2 text-[#888888] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No matching wineries found</p>
                    <p className="text-xs mt-1">Try modifying your search criteria or register a new estate partner.</p>
                  </td>
                </tr>
              )}

              {!loading && filteredWineries.map((winery) => {
                const status = (winery.status || 'draft').toLowerCase()
                const isApproved = status === 'approved' || status === 'active'
                const isPending = status === 'pending' || status === 'draft'

                return (
                  <tr key={winery.id} className="hover:bg-[#F8F9FB] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center font-serif shrink-0">
                          <Wine size={18} />
                        </div>
                        <div>
                          <span className="font-semibold text-[#222222] text-sm font-serif block group-hover:text-[#6D071A] transition-colors">
                            {winery.name}
                          </span>
                          <span className="text-[11px] text-[#888888]">
                            {winery.email || 'Email unavailable'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#6D071A] shrink-0" />
                        <span>{winery.city ? `${winery.city}, ${winery.state || winery.country || 'India'}` : 'Terroir unlisted'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                        isApproved
                          ? 'bg-[#FAF5D3] text-[#936F18] border-[#D4AF37]/30'
                          : isPending
                          ? 'bg-[#FDF2F4] text-[#6D071A] border-[#6D071A]/30'
                          : 'bg-[#F8F9FB] text-[#888888] border-[#ECECEC]'
                      }`}>
                        {isApproved ? <CheckCircle2 size={11} className="text-[#D4AF37]" /> : <Clock size={11} />}
                        {winery.status || 'Draft'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-mono">
                      {new Date(winery.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <button 
                        onClick={() => alert(`Estate Details:\n\nName: ${winery.name}\nCity: ${winery.city || 'N/A'}\nStatus: ${winery.status || 'N/A'}\nCreated: ${new Date(winery.created_at).toLocaleString()}`)}
                        className="text-[#6D071A] hover:text-[#841126] font-semibold px-3 py-1.5 hover:bg-[#FDF2F4] rounded-lg transition-colors border border-transparent hover:border-[#6D071A]/20 cursor-pointer"
                      >
                        Inspect
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
