'use client'

import { Ticket } from 'lucide-react'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Booking Management</h1>
        <p className="text-muted-foreground">Manage and view all bookings across the platform.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">ID / User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Winery</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Type / Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Guests</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading bookings...</td></tr>}
              {!loading && bookings.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No bookings found.</td></tr>}
              {!loading && bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                        <Ticket size={20} />
                      </div>
                      <div>
                         <span className="font-semibold text-foreground text-sm block">{booking.users?.full_name || 'Unknown User'}</span>
                         <span className="text-xs text-muted-foreground font-mono">{booking.id.substring(0,8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {booking.wineries?.name || 'Unknown Winery'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {booking.events?.title ? `Event: ${booking.events.title}` : booking.experiences?.title ? `Experience: ${booking.experiences.title}` : 'Unknown'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">
                    {booking.guests || 1}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20">
                      {booking.booking_status || 'Unknown'}
                    </span>
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
