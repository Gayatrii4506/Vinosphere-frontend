'use client'

import { 
  Users, Wine, FileCheck, IndianRupee, Store, 
  Calendar, Compass, Ticket, Activity, UserPlus, Star
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardOverview() {
  const [counts, setCounts] = useState({
    users: 0,
    wineries: 0,
    wines: 0,
    events: 0,
    experiences: 0,
    bookings: 0,
    reviews: 0,
    pendingWineries: 0
  })
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchCounts() {
      const fetchCount = async (table: string, filter?: { col: string, val: string }) => {
        let query = supabase.from(table).select('*', { count: 'exact', head: true })
        if (filter) query = query.eq(filter.col, filter.val)
        const { count } = await query
        return count || 0
      }

      const [users, wineries, wines, events, experiences, bookings, reviews, pendingWineries] = await Promise.all([
        fetchCount('users'),
        fetchCount('wineries'),
        fetchCount('wines'),
        fetchCount('events'),
        fetchCount('experiences'),
        fetchCount('bookings'),
        fetchCount('reviews'),
        fetchCount('wineries', { col: 'status', val: 'pending' })
      ])

      setCounts({ users, wineries, wines, events, experiences, bookings, reviews, pendingWineries })
    }

    fetchCounts()

      // Realtime subscriptions
    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wineries' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wines' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => fetchCounts())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const [analyticsData, setAnalyticsData] = useState<any[]>([])

  useEffect(() => {
    async function fetchAnalytics() {
      // Calculate date 6 months ago to explicitly filter the data range
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const dateStr = sixMonthsAgo.toISOString()

      // Fetch all records created within the last 6 months rather than an arbitrary limit cap
      const [{ data: recentUsers }, { data: recentBookings }] = await Promise.all([
        supabase.from('users').select('created_at').gte('created_at', dateStr),
        supabase.from('bookings').select('created_at').gte('created_at', dateStr)
      ])

      // Group by month client-side (securely handles up to tens of thousands of lightweight rows efficiently)
      const months: Record<string, { name: string, users: number, bookings: number }> = {}
      
      // Pre-fill the last 6 months to ensure continuity even if no data exists for a specific month
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`
        months[monthKey] = { name: d.toLocaleString('default', { month: 'short' }), users: 0, bookings: 0 }
      }
      
      const processDates = (data: any[] | null, key: 'users' | 'bookings') => {
        if (!data) return
        data.forEach(item => {
          if (!item.created_at) return
          const date = new Date(item.created_at)
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          
          if (months[monthKey]) {
            months[monthKey][key]++
          }
        })
      }

      processDates(recentUsers, 'users')
      processDates(recentBookings, 'bookings')

      const sortedData = Object.values(months)
      setAnalyticsData(sortedData)
    }
    fetchAnalytics()
  }, [supabase])

  const metrics = [
    { name: 'Total Users', value: counts.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Total Wineries', value: counts.wineries, icon: Store, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
    { name: 'Total Wines', value: counts.wines, icon: Wine, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
    { name: 'Total Events', value: counts.events, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
    { name: 'Total Experiences', value: counts.experiences, icon: Compass, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20' },
    { name: 'Total Bookings', value: counts.bookings, icon: Ticket, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Total Reviews', value: counts.reviews, icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Pending Approvals', value: counts.pendingWineries, icon: FileCheck, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ]

  const customTooltipStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    color: 'var(--color-foreground)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Real-time metrics and trends across the VinoSphere platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-card rounded-2xl border border-border p-5 flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl border ${metric.bg} ${metric.color}`}>
              <metric.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{metric.value}</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">{metric.name}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            <Activity className="text-sky-500" size={20} /> Recent User Growth
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#0ea5e9' }} />
                <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            <Ticket className="text-indigo-500" size={20} /> Recent Booking Trends
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#6366f1' }} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
