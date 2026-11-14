'use client'

import { 
  Users, Wine, FileCheck, Store, 
  Calendar, Compass, Ticket, Activity, Star
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, 
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
        try {
          let query = supabase.from(table).select('*', { count: 'exact', head: true })
          if (filter) query = query.eq(filter.col, filter.val)
          const { count } = await query
          return count || 0
        } catch {
          return 0
        }
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
  }, [supabase])

  const [analyticsData, setAnalyticsData] = useState<any[]>([])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        const dateStr = sixMonthsAgo.toISOString()

        const [{ data: recentUsers }, { data: recentBookings }] = await Promise.all([
          supabase.from('users').select('created_at').gte('created_at', dateStr),
          supabase.from('bookings').select('created_at').gte('created_at', dateStr)
        ])

        const months: Record<string, { name: string, users: number, bookings: number }> = {}
        
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

        setAnalyticsData(Object.values(months))
      } catch (err) {
        console.warn('Analytics fetch notice:', err)
      }
    }
    fetchAnalytics()
  }, [supabase])

  const metrics = [
    { name: 'Total Users', value: counts.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
    { name: 'Total Wineries', value: counts.wineries, icon: Store, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
    { name: 'Total Wines', value: counts.wines, icon: Wine, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' },
    { name: 'Total Events', value: counts.events, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
    { name: 'Total Experiences', value: counts.experiences, icon: Compass, color: 'text-teal-500', bg: 'bg-teal-50 border-teal-200' },
    { name: 'Total Bookings', value: counts.bookings, icon: Ticket, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-200' },
    { name: 'Total Reviews', value: counts.reviews, icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
    { name: 'Pending Approvals', value: counts.pendingWineries, icon: FileCheck, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  ]

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Platform Overview</h1>
        <p className="text-slate-500">Real-time metrics and trends across the VinoSphere platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl border ${metric.bg} ${metric.color}`}>
              <metric.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-slate-900">{metric.value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{metric.name}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 flex items-center gap-2">
            <Activity className="text-sky-500" size={20} /> Recent User Growth
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#0ea5e9' }} />
                <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 flex items-center gap-2">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
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
