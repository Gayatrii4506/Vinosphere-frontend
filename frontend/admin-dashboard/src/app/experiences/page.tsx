'use client'

import { Compass } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchExperiences() {
      const { data } = await supabase
        .from('experiences')
        .select(`
          *,
          wineries(name)
        `)
      
      if (data) setExperiences(data)
      setLoading(false)
    }

    fetchExperiences()

    const channel = supabase.channel('experiences_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => fetchExperiences())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6D071A] font-mono">
              Terroir & Hospitality
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Tasting Tours & Cellar Experiences
          </h1>
          <p className="text-[#888888] text-xs mt-1">
            Immersive masterclasses, barrel tastings, and vineyard walking tours offered by partner estates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FDF2F4] text-[#6D071A] font-bold text-xs rounded-xl border border-[#6D071A]/20 flex items-center gap-2">
            <Compass size={14} className="text-[#D4AF37]" />
            <span>{experiences.length} Experiences Configured</span>
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#FAF7F2]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Experience Title
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Host Estate
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Classification
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]/60 text-sm">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#888888]">
                    <div className="inline-block w-6 h-6 border-2 border-[#6D071A] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Accessing curated tasting itineraries...</p>
                  </td>
                </tr>
              )}

              {!loading && experiences.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#888888]">
                    <Compass size={32} className="mx-auto mb-2 text-[#888888] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No experiences listed</p>
                    <p className="text-xs mt-1">Winery estates will configure tastings, harvest tours, and pairing menus here.</p>
                  </td>
                </tr>
              )}

              {!loading && experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#F8F9FB] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center shrink-0">
                        <Compass size={18} />
                      </div>
                      <div>
                        <span className="font-semibold text-[#222222] text-sm font-serif block group-hover:text-[#6D071A] transition-colors">
                          {exp.title || exp.name || 'Signature Estate Tasting'}
                        </span>
                        {exp.description && (
                          <span className="text-[11px] text-[#888888] line-clamp-1 max-w-sm">
                            {exp.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-medium">
                    {exp.wineries?.name || 'Partner Estate'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-[#FDF2F4] text-[#6D071A] border-[#6D071A]/20">
                      Guided Terroir
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button 
                      onClick={() => alert(`Experience Dossier:\n\nTitle: ${exp.title || exp.name}\nEstate: ${exp.wineries?.name || 'N/A'}`)}
                      className="text-[#6D071A] hover:text-[#841126] font-semibold px-3 py-1.5 hover:bg-[#FDF2F4] rounded-lg transition-colors border border-transparent hover:border-[#6D071A]/20 cursor-pointer"
                    >
                      Inspect
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
