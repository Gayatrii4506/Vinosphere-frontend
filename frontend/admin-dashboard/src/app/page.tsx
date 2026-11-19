'use client'

import { 
  Users, Wine, FileCheck, Store, 
  Calendar, Compass, Ticket, Activity, Star,
  TrendingUp, ArrowRight, Sparkles, Layers,
  BookmarkCheck, CheckCircle2, ChevronRight
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardOverview() {
  const [adminName, setAdminName] = useState('Administrator')
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

  // Fetch admin user profile / email for personalized greeting
  useEffect(() => {
    async function getAdminProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const name = user.user_metadata?.full_name || 
                       user.email?.split('@')[0]?.replace(/[._]/g, ' ') || 
                       'Super Admin'
          const formatted = name.replace(/\b\w/g, (c: string) => c.toUpperCase())
          setAdminName(formatted)
        }
      } catch (err) {
        // Fallback default
      }
    }
    getAdminProfile()
  }, [supabase])

  // Fetch counts with real-time sync
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
        fetchCount('wineries', { col: 'status', val: 'draft' })
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

      const sortedData = Object.values(months)
      setAnalyticsData(sortedData)
    }
    fetchAnalytics()
  }, [supabase])

  // Winery Management Suite Inspired Metrics
  const metrics = [
    { 
      name: 'Registered Patrons', 
      value: counts.users, 
      icon: Users, 
      badge: 'Active Members',
      color: 'text-[#6D071A]', 
      bg: 'bg-[#FDF2F4] border-[#6D071A]/20'
    },
    { 
      name: 'Certified Wineries', 
      value: counts.wineries, 
      icon: Store, 
      badge: 'Estate Directory',
      color: 'text-[#936F18]', 
      bg: 'bg-[#FAF5D3] border-[#D4AF37]/30'
    },
    { 
      name: 'Wine Catalog', 
      value: counts.wines, 
      icon: Wine, 
      badge: 'Vintages Indexed',
      color: 'text-[#6D071A]', 
      bg: 'bg-[#FDF2F4] border-[#6D071A]/20'
    },
    { 
      name: 'Estate Events', 
      value: counts.events, 
      icon: Calendar, 
      badge: 'Scheduled',
      color: 'text-[#936F18]', 
      bg: 'bg-[#FAF5D3] border-[#D4AF37]/30'
    },
    { 
      name: 'Curated Experiences', 
      value: counts.experiences, 
      icon: Compass, 
      badge: 'Tastings & Tours',
      color: 'text-[#6D071A]', 
      bg: 'bg-[#FDF2F4] border-[#6D071A]/20'
    },
    { 
      name: 'Guest Reservations', 
      value: counts.bookings, 
      icon: Ticket, 
      badge: 'Confirmed Bookings',
      color: 'text-[#936F18]', 
      bg: 'bg-[#FAF5D3] border-[#D4AF37]/30'
    },
    { 
      name: 'Sommelier Reviews', 
      value: counts.reviews, 
      icon: Star, 
      badge: 'Platform Scores',
      color: 'text-[#D4AF37]', 
      bg: 'bg-[#FAF5D3] border-[#D4AF37]/30'
    },
    { 
      name: 'Pending Onboarding', 
      value: counts.pendingWineries, 
      icon: FileCheck, 
      badge: counts.pendingWineries > 0 ? 'Action Needed' : 'Up to Date',
      color: counts.pendingWineries > 0 ? 'text-[#6D071A] animate-pulse' : 'text-[#888888]', 
      bg: counts.pendingWineries > 0 ? 'bg-[#FDF2F4] border-[#6D071A]/30' : 'bg-[#F8F9FB] border-[#ECECEC]'
    },
  ]

  const customTooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECECEC',
    borderRadius: '12px',
    color: '#222222',
    padding: '10px 14px',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
  }

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner — Modeled after Winery Management Suite */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-[#ECECEC] shadow-sm relative overflow-hidden">
        {/* Subtle radial glows */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#6D071A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 text-left z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#6D071A] tracking-wider">Superadmin Console</span>
            <span className="px-2 py-0.5 bg-[#6D071A] text-white text-[9px] font-bold rounded-full">VinoSphere v2.4</span>
          </div>
          <h2 className="text-3xl font-bold font-serif text-[#222222]">
            Welcome back, <br className="sm:hidden" />
            <span className="text-gradient-burgundy">{adminName}</span>
          </h2>
          <p className="text-xs text-[#6D6D6D] max-w-xl">
            Here is your executive ecosystem overview. Review pending estate applications, monitor vintage listings, track reservation volume, and inspect real-time platform telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <Link
            href="/approvals"
            className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-[#FAF5D3]" />
            <span>Verify Wineries ({counts.pendingWineries})</span>
          </Link>
          <Link
            href="/analytics"
            className="px-4 py-2.5 bg-white border border-[#ECECEC] text-[#222222] hover:bg-[#F8F9FB] text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* PERFORMANCE KPI CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#888888]">
            Platform Key Performance Indicators
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6D071A] bg-[#FDF2F4] px-2.5 py-1 rounded-lg border border-[#6D071A]/20">
            <span className="w-2 h-2 rounded-full bg-[#6D071A] animate-ping" />
            <span>Telemetry Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div 
                key={metric.name} 
                className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative overflow-hidden group hover:shadow-md hover:border-[#6D071A]/30 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">{metric.name}</p>
                  <div className={`p-2 rounded-xl border ${metric.bg} ${metric.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                </div>

                <p className="text-2xl font-bold font-serif text-[#222222] mt-2">
                  {metric.value.toLocaleString()}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#6D071A] bg-[#FDF2F4] px-2 py-0.5 rounded-md border border-[#6D071A]/10">
                    {metric.badge}
                  </span>
                  <span className="text-[#888888]">Live Count</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RECHARTS PERFORMANCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECECEC] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#222222] flex items-center gap-2">
                <TrendingUp className="text-[#6D071A] w-4 h-4" /> 
                Patron & Member Acquisition
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">New user accounts enrolled over the last 6 months</p>
            </div>
            <span className="text-xs font-semibold text-[#6D071A] bg-[#FDF2F4] px-2.5 py-1 rounded-full border border-[#6D071A]/20">
              6M Trend
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" opacity={0.8} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={customTooltipStyle} 
                  labelStyle={{ fontWeight: 'bold', color: '#6D071A', marginBottom: 4 }}
                  itemStyle={{ color: '#222222' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6D071A" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6D071A', strokeWidth: 2, stroke: '#FFFFFF' }} 
                  activeDot={{ r: 6, fill: '#D4AF37', stroke: '#FFFFFF', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Trends Area Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECECEC] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#222222] flex items-center gap-2">
                <Ticket className="text-[#D4AF37] w-4 h-4" /> 
                Hospitality & Tasting Reservations
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">Event tickets and tasting bookings per month</p>
            </div>
            <span className="text-xs font-semibold text-[#936F18] bg-[#FAF5D3] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              Hospitality Yield
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="wineryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" opacity={0.8} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={customTooltipStyle} 
                  labelStyle={{ fontWeight: 'bold', color: '#6D071A', marginBottom: 4 }}
                  itemStyle={{ color: '#222222' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#D4AF37" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#wineryAreaGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK DIRECTIVES ROW */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-[#888888]">
          Quick Action Directives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/approvals"
            className="group p-5 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#6D071A]/40 hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck size={18} />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#222222] group-hover:text-[#6D071A] transition-colors">
                  Verify Winery Applications
                </p>
                <p className="text-[11px] text-[#888888]">
                  {counts.pendingWineries} pending review & onboarding
                </p>
              </div>
            </div>
            <ArrowRight size={15} className="text-[#888888] group-hover:translate-x-1 group-hover:text-[#6D071A] transition-all" />
          </Link>

          <Link 
            href="/wineries"
            className="group p-5 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#D4AF37]/50 hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5D3] text-[#936F18] border border-[#D4AF37]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Store size={18} />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#222222] group-hover:text-[#936F18] transition-colors">
                  Manage Certified Wineries
                </p>
                <p className="text-[11px] text-[#888888]">
                  {counts.wineries} active estates in ecosystem
                </p>
              </div>
            </div>
            <ArrowRight size={15} className="text-[#888888] group-hover:translate-x-1 group-hover:text-[#936F18] transition-all" />
          </Link>

          <Link 
            href="/wines"
            className="group p-5 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#6D071A]/40 hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wine size={18} />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#222222] group-hover:text-[#6D071A] transition-colors">
                  Inspect Wine Catalog
                </p>
                <p className="text-[11px] text-[#888888]">
                  {counts.wines} bottled vintages registered
                </p>
              </div>
            </div>
            <ArrowRight size={15} className="text-[#888888] group-hover:translate-x-1 group-hover:text-[#6D071A] transition-all" />
          </Link>
        </div>
      </div>
    </div>
  )
}
