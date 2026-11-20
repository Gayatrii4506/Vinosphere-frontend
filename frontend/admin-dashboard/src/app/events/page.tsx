'use client'

import { Calendar, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
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
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Hospitality & Gatherings
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Estate Events & Festivals
          </h1>
          <p className="text-[#888888] text-xs mt-1">
            Wine harvest celebrations, masterclasses, and vineyard sunset dinners across partner estates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FAF5D3] text-[#936F18] font-bold text-xs rounded-xl border border-[#D4AF37]/30 flex items-center gap-2">
            <Calendar size={14} className="text-[#D4AF37]" />
            <span>{events.length} Events Scheduled</span>
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
                  Event Title & Experience
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Host Estate
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Scheduled Date
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Guest Capacity
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
                    <div className="inline-block w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Fetching estate gathering calendars...</p>
                  </td>
                </tr>
              )}

              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    <Calendar size={32} className="mx-auto mb-2 text-[#888888] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No events currently scheduled</p>
                    <p className="text-xs mt-1">Partner wineries will post upcoming seasonal gatherings here.</p>
                  </td>
                </tr>
              )}

              {!loading && events.map((event) => (
                <tr key={event.id} className="hover:bg-[#F8F9FB] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF5D3] text-[#936F18] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <span className="font-semibold text-[#222222] text-sm font-serif block group-hover:text-[#6D071A] transition-colors">
                          {event.title}
                        </span>
                        {event.description && (
                          <span className="text-[11px] text-[#888888] line-clamp-1 max-w-xs">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-medium">
                    {event.wineries?.name || 'Exclusive Vineyard'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-mono">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-[#FAF5D3] text-[#936F18] border-[#D4AF37]/30">
                      <Users size={11} />
                      {event.capacity ? `${event.capacity} Guests` : 'Open'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button 
                      onClick={() => setSelectedEvent(event)}
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

      {/* EVENT INSPECT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-[#ECECEC] shadow-2xl space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6D071A]" />
                <h3 className="text-base font-bold font-serif text-[#222222]">Event Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition"
              >
                <X className="w-4 h-4 text-charcoal-600" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EDE5D8] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888888]">Event Title:</span>
                <span className="font-bold text-[#222222]">{selectedEvent.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Host Estate:</span>
                <span className="font-semibold text-[#6D071A]">{selectedEvent.wineries?.name || 'Partner Estate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Scheduled Date:</span>
                <span className="font-mono text-stone-700">
                  {selectedEvent.event_date ? new Date(selectedEvent.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Capacity Limit:</span>
                <span className="font-bold text-[#222222]">{selectedEvent.capacity ? `${selectedEvent.capacity} Attendees` : 'Open Attendance'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Ticket Price:</span>
                <span className="font-bold text-[#6D071A]">{selectedEvent.price ? `₹${selectedEvent.price}` : 'Complimentary'}</span>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="p-3 bg-white rounded-xl border border-[#ECECEC] text-xs">
                <span className="font-bold text-[#222222] block mb-1">Event Program &amp; Details</span>
                <p className="text-stone-600 leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
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
