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
      // For experiences, we don't know the exact schema as probe returned "empty but exists",
      // but assuming standard conventions for title/winery_id
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Experience Management</h1>
        <p className="text-slate-500">Manage and view all winery experiences (Tastings, Tours, etc).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Winery</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading experiences...</td></tr>}
              {!loading && experiences.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No experiences found.</td></tr>}
              {!loading && experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                        <Compass size={20} />
                      </div>
                      <span className="font-semibold text-slate-900 text-base">{exp.title || exp.name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500">
                    {exp.wineries?.name || 'Unknown Winery'}
                  </td>
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
