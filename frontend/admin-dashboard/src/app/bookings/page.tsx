'use client'

import { Ticket, Users, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookings() {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          users(full_name, email),
          wineries(name),
          events(title),
          experiences(title)
        `)
        .order('created_at', { ascending: false })
      
      if (data) setBookings(data)
      setLoading(false)
    }

    fetchBookings()

    const channel = supabase.channel('bookings_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Guest Services & Hospitality
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Reservations & Bookings
          </h1>
          <p className="text-[#71717A] text-sm mt-1">
            Real-time ledger of guest tasting appointments, festival passes, and masterclass admissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FAF5D3] text-[#936F18] font-semibold text-xs rounded-xl border border-[#D4AF37]/30 flex items-center gap-2">
            <Ticket size={14} className="text-[#936F18]" />
            <span>{bookings.length} Confirmed Records</span>
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#F8F9FB]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Guest Reference
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Estate Destination
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Experience / Event
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Party Size
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]/70 text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#71717A]">
                    <div className="inline-block w-6 h-6 border-2 border-[#6D071A] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Synchronizing guest reservations...</p>
                  </td>
                </tr>
              )}

              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#71717A]">
                    <Ticket size={32} className="mx-auto mb-2 text-[#71717A] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No bookings recorded</p>
                    <p className="text-xs mt-1 text-[#71717A]">Consumer reservations for estate events and tours will synchronize here.</p>
                  </td>
                </tr>
              )}

              {!loading && bookings.map((booking) => {
                const status = (booking.booking_status || 'confirmed').toLowerCase()
                const isConfirmed = status === 'confirmed' || status === 'completed'
                const isPending = status === 'pending'

                return (
                  <tr key={booking.id} className="hover:bg-[#F8F9FB] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center shrink-0">
                          <Ticket size={18} />
                        </div>
                        <div>
                          <span className="font-semibold text-[#222222] text-sm block group-hover:text-[#6D071A] transition-colors">
                            {booking.users?.full_name || 'Guest Connoisseur'}
                          </span>
                          <span className="text-[10px] text-[#71717A] font-mono">
                            REF: {booking.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#71717A] text-xs font-medium">
                      {booking.wineries?.name || 'Partner Estate'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#222222] text-xs font-serif font-medium">
                      {booking.events?.title 
                        ? `Event: ${booking.events.title}` 
                        : booking.experiences?.title 
                        ? `Experience: ${booking.experiences.title}` 
                        : 'Estate Wine Tasting'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-[#F8F9FB] text-[#71717A] border-[#ECECEC]">
                        <Users size={11} />
                        {booking.guests || 1} Guests
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                        isConfirmed
                          ? 'bg-[#FAF5D3] text-[#936F18] border-[#D4AF37]/30'
                          : isPending
                          ? 'bg-[#FDF2F4] text-[#6D071A] border-[#6D071A]/30'
                          : 'bg-[#F8F9FB] text-[#71717A] border-[#ECECEC]'
                      }`}>
                        {isConfirmed ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {booking.booking_status || 'Confirmed'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <button 
                        onClick={() => alert(`Booking Details:\n\nRef: ${booking.id}\nGuest: ${booking.users?.full_name || 'N/A'}\nGuests: ${booking.guests || 1}\nEstate: ${booking.wineries?.name || 'N/A'}`)}
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
