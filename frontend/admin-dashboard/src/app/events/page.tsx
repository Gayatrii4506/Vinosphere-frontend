'use client'

import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select(`
          *,
          wineries(name)
        `)
        .order('event_date', { ascending: true })
      
      if (data) setEvents(data)
      setLoading(false)
    }

    fetchEvents()

    const channel = supabase.channel('events_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Event Management</h1>
        <p className="text-muted-foreground">Manage and view all winery events.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Event Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Winery</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Capacity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading events...</td></tr>}
              {!loading && events.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No events found.</td></tr>}
              {!loading && events.map((event) => (
                <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
                        <Calendar size={20} />
                      </div>
                      <span className="font-semibold text-foreground text-base">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {event.wineries?.name || 'Unknown Winery'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">{event.capacity || 'N/A'}</td>
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
