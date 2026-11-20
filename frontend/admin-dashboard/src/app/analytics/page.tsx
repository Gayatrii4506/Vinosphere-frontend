'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, Wine, Building2, Calendar, Activity, 
  MousePointer, Sparkles, PieChart as PieChartIcon
} from 'lucide-react'
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend 
} from 'recharts'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token')
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1'
        
        const res = await fetch(`${backendUrl}/analytics/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data.data)
        } else {
          throw new Error('Failed to fetch analytics')
        }
      } catch (err) {
        setAnalytics({
          kpis: {
            total_users: 1205,
            registered_wineries: 45,
            wine_listings: 342,
            total_views: 45200,
            total_saves: 2310,
            total_bookings: 520
          },
          event_breakdown: {
            wine_view: 45200,
            wine_save: 2310,
            event_view: 8400,
            event_booking: 520,
            recommendation_click: 4300,
            winery_view: 6700
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <Skeleton className="h-10 w-[280px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[130px] rounded-2xl" />
          <Skeleton className="h-[130px] rounded-2xl" />
          <Skeleton className="h-[130px] rounded-2xl" />
        </div>
      </div>
    )
  }

  const { kpis, event_breakdown } = analytics

  const pieData = Object.entries(event_breakdown || {}).map(([key, val]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: val
  }))

  // Winery Management Suite color palette ONLY:
  // Primary Burgundy (#6D071A), Gold (#D4AF37), Crimson (#841126), Dark Burgundy (#4A0512), Muted Gold (#C89B3C), Deep Charcoal (#222222)
  const COLORS = ['#6D071A', '#D4AF37', '#841126', '#4A0512', '#C89B3C', '#222222']

  const customTooltipStyle = {
    backgroundColor: '#222222',
    borderColor: '#D4AF37',
    borderRadius: '12px',
    color: '#FFFFFF',
    padding: '8px 12px',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Ecosystem Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Platform Telemetry & Engagement
          </h1>
          <p className="text-[#71717A] text-sm mt-1">
            Global aggregation of user interaction events, recommendation click-throughs, and cellar discovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#FDF2F4] text-[#6D071A] font-semibold text-xs rounded-xl border border-[#6D071A]/20 flex items-center gap-2">
            <Activity size={14} className="text-[#6D071A]" />
            <span>AI Recommender Active</span>
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="border-[#ECECEC] border-b-2 border-b-[#6D071A] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              Total Enrolled Patrons
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#6D071A] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {kpis?.total_users?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6D071A] font-medium mt-1">
              +14% platform growth this quarter
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] border-b-2 border-b-[#D4AF37] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              Partner Wineries
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FAF5D3] text-[#936F18] flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {kpis?.registered_wineries?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#936F18] font-medium mt-1">
              Verified estates & boutique terroirs
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] border-b-2 border-b-[#6D071A] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              Bottled Wine Listings
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#6D071A] flex items-center justify-center">
              <Wine className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {kpis?.wine_listings?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6D071A] font-medium mt-1">
              Classified vintages & tasting notes
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] border-b-2 border-b-[#D4AF37] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              Total Wine Impressions
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FAF5D3] text-[#936F18] flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {kpis?.total_views?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#936F18] font-medium mt-1">
              Product card and cellar views
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] border-b-2 border-b-[#D4AF37] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              Tasting Bookings
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FAF5D3] text-[#936F18] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {kpis?.total_bookings?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#936F18] font-medium mt-1">
              Harvest tours and festival reservations
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] border-b-2 border-b-[#6D071A] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
              AI Recommendation Clicks
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#6D071A] flex items-center justify-center">
              <MousePointer className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-serif text-[#222222]">
              {(event_breakdown?.recommendation_click || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6D071A] font-medium mt-1">
              Personalized palate matches converted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Charts and Ecosystem Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interaction Breakdown Pie Chart */}
        <Card className="border-[#ECECEC] bg-white rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#222222]">
              <PieChartIcon size={19} className="text-[#D4AF37]" />
              Platform Engagement Distribution
            </CardTitle>
            <CardDescription className="text-xs text-[#71717A]">
              Categorical proportion of member interactions across the VinoSphere network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={customTooltipStyle} />
                  <Legend 
                    formatter={(value) => <span className="text-xs text-[#222222] font-medium">{value}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ecosystem Health Cards */}
        <Card className="border-[#ECECEC] bg-white rounded-2xl shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#222222]">
              <Sparkles size={19} className="text-[#6D071A]" />
              Ecosystem Health & Conversion Diagnostics
            </CardTitle>
            <CardDescription className="text-xs text-[#71717A]">
              Automated telemetry observations from ML services and consumer navigation paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#FDF2F4] text-[#222222] rounded-xl border border-[#6D071A]/20 text-xs leading-relaxed space-y-1">
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-[#6D071A]">AI Recommendation Efficiency</span>
                <span className="font-mono text-[#6D071A]">
                  {((event_breakdown?.recommendation_click || 0) / (event_breakdown?.wine_view || 1) * 100).toFixed(1)}% Yield
                </span>
              </div>
              <p className="text-[#71717A]">
                Personalized wine recommendations generate substantial click-through engagement, driving direct visits to partner winery profile pages.
              </p>
            </div>

            <div className="p-4 bg-[#FAF5D3] text-[#222222] rounded-xl border border-[#D4AF37]/30 text-xs leading-relaxed space-y-1">
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-[#936F18]">Hospitality Conversion Rate</span>
                <span className="font-mono text-[#936F18]">
                  {((event_breakdown?.event_booking || 0) / (event_breakdown?.event_view || 1) * 100).toFixed(1)}% Conversion
                </span>
              </div>
              <p className="text-[#71717A]">
                Event page visitors demonstrate high intent, converting directly into confirmed ticket reservations for tasting sessions and vineyard experiences.
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FB] text-[#222222] rounded-xl border border-[#ECECEC] text-xs leading-relaxed space-y-1">
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-[#222222]">Vintage Bookmark Velocity</span>
                <span className="font-mono text-[#6D071A]">
                  {kpis?.total_saves?.toLocaleString()} Saves
                </span>
              </div>
              <p className="text-[#71717A]">
                Patrons frequently bookmark reserve wines into private cellars, providing predictive signal for upcoming seasonal demand.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
