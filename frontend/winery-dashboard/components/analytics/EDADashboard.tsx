'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line,
  Legend, Area, AreaChart, ComposedChart
} from 'recharts'
import {
  Activity, BarChart3, TrendingUp, Beaker, Wine, Users, Calendar,
  ChevronDown, ChevronUp, AlertCircle, Database, Loader2, Search, 
  PieChart as PieChartIcon, Zap, Layers
} from 'lucide-react'

// ─── API Layer ─────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1'

async function fetchEDA(endpoint: string) {
  const res = await fetch(`${API_BASE}/analytics/eda${endpoint}`)
  if (!res.ok) throw new Error(`EDA API error: ${res.status}`)
  const json = await res.json()
  return json.data
}

// ─── Color Palettes ────────────────────────────────────────────

const COLORS = ['#6D071A', '#D4AF37', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']
const HEATMAP_COLORS = { neg: '#3b82f6', zero: '#f5f5f4', pos: '#dc2626' }

function getHeatmapColor(value: number): string {
  if (value > 0) {
    const intensity = Math.min(Math.abs(value), 1)
    const r = Math.round(220 + (255 - 220) * (1 - intensity))
    const g = Math.round(38 + (245 - 38) * (1 - intensity))
    const b = Math.round(38 + (244 - 38) * (1 - intensity))
    return `rgb(${r},${g},${b})`
  } else if (value < 0) {
    const intensity = Math.min(Math.abs(value), 1)
    const r = Math.round(59 + (245 - 59) * (1 - intensity))
    const g = Math.round(130 + (245 - 130) * (1 - intensity))
    const b = Math.round(246 + (244 - 246) * (1 - intensity))
    return `rgb(${r},${g},${b})`
  }
  return '#f5f5f4'
}

// ─── Reusable UI Components ───────────────────────────────────

function SectionCard({ title, icon: Icon, children, subtitle, collapsible = false }: {
  title: string; icon: any; children: React.ReactNode; subtitle?: string; collapsible?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
      <div
        className={`px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between ${collapsible ? 'cursor-pointer hover:bg-stone-50 transition' : ''}`}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-burgundy-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#6D071A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#222222]">{title}</h3>
            {subtitle && <p className="text-[10px] text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {collapsible && (
          collapsed ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronUp className="w-4 h-4 text-stone-400" />
        )}
      </div>
      {!collapsed && <div className="p-6">{children}</div>}
    </div>
  )
}

function DataNotAvailable({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-700 font-medium">{message}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-[#6D071A] animate-spin" />
      <span className="ml-3 text-sm text-stone-500 font-medium">Loading analysis data...</span>
    </div>
  )
}

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-stone-50/80 rounded-xl p-4 border border-[#ECECEC]">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-[#222222] mt-1">{value}</p>
      {subtitle && <p className="text-[10px] text-stone-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ─── Custom Tooltip ────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-[#ECECEC] shadow-lg px-3.5 py-2.5 z-50 text-xs">
      {label && <p className="font-bold text-[#222222] mb-1 border-b border-stone-100 pb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="font-medium text-stone-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color || p.fill || '#6D071A' }} />
              {p.name || 'Value'}:
            </span>
            <span className="font-bold text-[#222222]">
              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN EDA DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function EDADashboard({ wineryId }: { wineryId: string }) {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Data states
  const [overview, setOverview] = useState<any>(null)
  const [distribution, setDistribution] = useState<any>(null)
  const [priceEngagement, setPriceEngagement] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [seasonality, setSeasonality] = useState<any>(null)
  const [bookingAnalysis, setBookingAnalysis] = useState<any>(null)
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null)
  const [correlation, setCorrelation] = useState<any>(null)

  const loadSection = useCallback(async (section: string) => {
    setLoading(true)
    setError('')
    try {
      switch (section) {
        case 'overview': {
          const data = await fetchEDA(`/overview/${wineryId}`)
          setOverview(data)
          break
        }
        case 'distribution': {
          const data = await fetchEDA(`/wine-distribution/${wineryId}`)
          setDistribution(data)
          break
        }
        case 'price-engagement': {
          const data = await fetchEDA(`/price-engagement/${wineryId}`)
          setPriceEngagement(data)
          break
        }
        case 'funnel': {
          const data = await fetchEDA(`/conversion-funnel/${wineryId}`)
          setFunnel(data)
          break
        }
        case 'seasonality': {
          const data = await fetchEDA(`/seasonality/${wineryId}`)
          setSeasonality(data)
          break
        }
        case 'bookings': {
          const data = await fetchEDA(`/booking-analysis/${wineryId}`)
          setBookingAnalysis(data)
          break
        }
        case 'quality': {
          const data = await fetchEDA('/quality-analysis')
          setQualityAnalysis(data)
          break
        }
        case 'correlation': {
          const data = await fetchEDA(`/correlation/${wineryId}`)
          setCorrelation(data)
          break
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load EDA data')
    } finally {
      setLoading(false)
    }
  }, [wineryId])

  useEffect(() => {
    loadSection(activeSection)
  }, [activeSection, loadSection])

  const sections = [
    { key: 'overview', label: 'Overview', icon: Database },
    { key: 'distribution', label: 'Wine Distribution', icon: PieChartIcon },
    { key: 'price-engagement', label: 'Price vs Engagement', icon: TrendingUp },
    { key: 'funnel', label: 'Engagement Funnel', icon: Layers },
    { key: 'seasonality', label: 'Seasonality', icon: Calendar },
    { key: 'bookings', label: 'Booking Analysis', icon: Users },
    { key: 'quality', label: 'Quality Analysis', icon: Beaker },
    { key: 'correlation', label: 'Correlations', icon: Zap },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#6D071A]" />
            <h2 className="text-xl font-bold font-serif text-[#222222]">Exploratory Data Analysis</h2>
          </div>
          <p className="text-xs text-stone-500">
            Statistical exploration of your winery&apos;s data — distributions, correlations, trends and quality analysis.
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-[#ECECEC]">
        {sections.map(s => {
          const Icon = s.icon
          const isActive = activeSection === s.key
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-[#6D071A] shadow-sm border border-[#ECECEC]'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? <LoadingState /> : (
        <>
          {activeSection === 'overview' && overview && <OverviewSection data={overview} />}
          {activeSection === 'distribution' && distribution && <DistributionSection data={distribution} />}
          {activeSection === 'price-engagement' && priceEngagement && <PriceEngagementSection data={priceEngagement} />}
          {activeSection === 'funnel' && funnel && <FunnelSection data={funnel} />}
          {activeSection === 'seasonality' && seasonality && <SeasonalitySection data={seasonality} />}
          {activeSection === 'bookings' && bookingAnalysis && <BookingSection data={bookingAnalysis} />}
          {activeSection === 'quality' && qualityAnalysis && <QualitySection data={qualityAnalysis} />}
          {activeSection === 'correlation' && correlation && <CorrelationSection data={correlation} />}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

function OverviewSection({ data }: { data: any }) {
  const { summary, dataQuality } = data
  return (
    <div className="space-y-6">
      <SectionCard title="EDA Overview" icon={Database} subtitle="Summary statistics & data quality assessment">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total Wines" value={summary.totalWines} />
          <StatCard label="Total Views" value={summary.totalViews.toLocaleString()} />
          <StatCard label="Total Saves" value={summary.totalSaves.toLocaleString()} />
          <StatCard label="Total Bookings" value={summary.totalBookings} />
          <StatCard label="Avg Price" value={summary.averageWinePrice ? `₹${summary.averageWinePrice.toLocaleString()}` : 'N/A'} />
          <StatCard label="Total Events" value={summary.totalEvents} />
          <StatCard label="Event Views" value={summary.totalEventViews} />
          <StatCard label="Avg Quality Score" value={summary.averageQualityScore ?? 'N/A'} subtitle="From grape dataset" />
        </div>

        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Data Quality Assessment</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(dataQuality).map(([key, val]: [string, any]) => {
            if (typeof val === 'object' && val.message) {
              return (
                <div key={key} className={`p-3 rounded-lg border text-xs ${val.available ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${val.available ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="font-bold text-stone-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <p className="text-stone-500 mt-1">{val.message}</p>
                </div>
              )
            }
            return null
          })}
          {!dataQuality.ratingsAvailable && (
            <div className="p-3 rounded-lg border bg-stone-50 border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stone-300" />
                <span className="font-bold text-stone-700">Ratings</span>
              </div>
              <p className="text-stone-500 mt-1">{dataQuality.ratingsMessage}</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}

function DistributionSection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient wine data for distribution analysis.'} />
  }

  const { distributions } = data

  return (
    <div className="space-y-6">
      {/* Wine Type & Grape Variety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {distributions.wineType && (
          <SectionCard title="Wine Type Distribution" icon={Wine}>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributions.wineType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {distributions.wineType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {distributions.grapeVariety && (
          <SectionCard title="Grape Variety Distribution" icon={BarChart3}>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.grapeVariety.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6D071A" radius={[0, 4, 4, 0]} maxBarSize={20} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Profile distributions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['sweetness', 'body', 'acidity', 'tannin'].map(field => {
          const dist = distributions[field]
          if (!dist) return null
          return (
            <SectionCard key={field} title={`${field.charAt(0).toUpperCase() + field.slice(1)} Profile`} icon={Activity}>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS[['sweetness', 'body', 'acidity', 'tannin'].indexOf(field)]} radius={[4, 4, 0, 0]} maxBarSize={30} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )
        })}
      </div>

      {/* Price distribution */}
      {distributions.price && (
        <SectionCard title="Price Distribution" icon={TrendingUp} subtitle={`Avg: ₹${distributions.price.stats.mean.toLocaleString()} | Median: ₹${distributions.price.stats.median.toLocaleString()}`}>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributions.price.histogram}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={40} name="Wines" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function PriceEngagementSection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient data for price vs engagement analysis.'} />
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Price vs Views" icon={TrendingUp} subtitle="Each point represents a wine — position shows price (x) and view count (y)">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="price" name="Price (₹)" tick={{ fontSize: 10, fill: '#6b7280' }} label={{ value: 'Price (₹)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="views" name="Views" tick={{ fontSize: 10, fill: '#6b7280' }} label={{ value: 'Views', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white rounded-xl border border-[#ECECEC] shadow-lg px-4 py-3 text-xs">
                    <p className="font-bold text-[#222222]">{d.wineName}</p>
                    <p className="text-stone-500">Price: ₹{d.price?.toLocaleString()}</p>
                    <p className="text-stone-500">Views: {d.views}</p>
                    <p className="text-stone-500">Saves: {d.saves}</p>
                  </div>
                )
              }} />
              <Scatter data={data.dataPoints} fill="#6D071A" fillOpacity={0.7} r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {data.summaryStats && (
        <SectionCard title="Correlation Summary" icon={Zap} subtitle="Statistical association — does not imply causation">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-[#ECECEC] text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Price ↔ Views</p>
              <p className={`text-2xl font-bold ${data.summaryStats.priceViewCorrelation > 0.3 ? 'text-emerald-600' : data.summaryStats.priceViewCorrelation < -0.3 ? 'text-red-600' : 'text-stone-600'}`}>
                {data.summaryStats.priceViewCorrelation}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-[#ECECEC] text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Price ↔ Saves</p>
              <p className={`text-2xl font-bold ${data.summaryStats.priceSaveCorrelation > 0.3 ? 'text-emerald-600' : data.summaryStats.priceSaveCorrelation < -0.3 ? 'text-red-600' : 'text-stone-600'}`}>
                {data.summaryStats.priceSaveCorrelation}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-[#ECECEC]">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Note</p>
              <p className="text-[10px] text-stone-500 leading-relaxed">{data.summaryStats.note}</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function FunnelSection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient data for engagement funnel.'} />
  }

  const maxCount = Math.max(...data.stages.map((s: any) => s.count), 1)

  return (
    <SectionCard title="Aggregate Engagement Funnel" icon={Layers} subtitle={data.disclaimer}>
      <div className="space-y-3 mb-6">
        {data.stages.map((stage: any, i: number) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-44 text-right">
              <span className="text-xs font-bold text-stone-700">{stage.stage}</span>
            </div>
            <div className="flex-1 h-8 bg-stone-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700"
                style={{
                  width: `${Math.max((stage.count / maxCount) * 100, 2)}%`,
                  backgroundColor: COLORS[i],
                }}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-white drop-shadow-sm">
                {stage.count.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.conversions?.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Conversion Rates</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.conversions.map((c: any, i: number) => (
              <div key={i} className="p-3 bg-stone-50 rounded-lg border border-[#ECECEC] text-xs">
                <p className="text-stone-500">{c.from} → {c.to}</p>
                <p className="text-lg font-bold text-[#6D071A] mt-1">{c.rate}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function SeasonalitySection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient data for seasonality analysis.'} />
  }

  return (
    <div className="space-y-6">
      {/* Daily engagement */}
      {data.daily?.length > 0 && (
        <SectionCard title="Daily Engagement Trend" icon={Activity}>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="views" fill="#6D071A" fillOpacity={0.1} stroke="#6D071A" strokeWidth={2} name="Views" />
                <Area type="monotone" dataKey="saves" fill="#D4AF37" fillOpacity={0.1} stroke="#D4AF37" strokeWidth={2} name="Saves" />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of week */}
        {data.dayOfWeek?.length > 0 && (
          <SectionCard title="Day-of-Week Activity" icon={Calendar}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={35} name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {/* Booking trend */}
        {data.bookingTrend?.length > 0 && (
          <SectionCard title="Booking Trend" icon={TrendingUp}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} name="Bookings" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} name="Revenue (₹)" />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  )
}

function BookingSection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient booking data.'} />
  }

  const { summary } = data

  return (
    <div className="space-y-6">
      <SectionCard title="Booking Summary" icon={Users}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total Bookings" value={summary.totalBookings} />
          <StatCard label="Total Revenue" value={`₹${summary.totalAmount.toLocaleString()}`} />
          <StatCard label="Avg Booking" value={`₹${summary.averageAmount.toLocaleString()}`} />
          <StatCard label="Total Guests" value={summary.totalGuests} />
          <StatCard label="Avg Guests" value={summary.averageGuests} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summary.statusBreakdown?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Status Breakdown</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.statusBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, count, value }: any) => `${name}: ${count ?? value ?? 0}`} labelLine={false}>
                      {summary.statusBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {data.guestsVsRevenue?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Guests vs Revenue</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="guests" name="Guests" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis dataKey="amount" name="Amount (₹)" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-[#ECECEC] shadow-lg px-3.5 py-2.5 text-xs">
                          <p className="font-bold text-[#222222]">Booking Data Point</p>
                          <p className="text-stone-600 font-medium">Guests: {d.guests}</p>
                          <p className="text-stone-600 font-medium">Amount: ₹{d.amount?.toLocaleString()}</p>
                          {d.type && <p className="text-[10px] text-stone-400 capitalize">Type: {d.type}</p>}
                        </div>
                      )
                    }} />
                    <Scatter data={data.guestsVsRevenue} fill="#6D071A" fillOpacity={0.6} r={5} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Event breakdown */}
      {data.eventBreakdown?.length > 0 && (
        <SectionCard title="Event Capacity Utilization" icon={BarChart3}>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.eventBreakdown} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: '#6b7280' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacityUtilization" fill="#6D071A" radius={[0, 4, 4, 0]} maxBarSize={20} name="Capacity %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function QualitySection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Wine quality dataset not available.'} />
  }

  return (
    <div className="space-y-6">
      {/* Descriptive stats */}
      <SectionCard title="Physicochemical Descriptive Statistics" icon={Beaker} subtitle={`${data.totalSamples} samples analyzed`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#ECECEC]">
                <th className="text-left py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Parameter</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Count</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Mean</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Median</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Min</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Max</th>
                <th className="text-right py-2 px-3 font-bold text-stone-400 uppercase text-[10px]">Std Dev</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.descriptive || {}).map(([key, stats]: [string, any]) => (
                <tr key={key} className="border-b border-stone-50 hover:bg-stone-50/50 transition">
                  <td className="py-2 px-3 font-semibold text-stone-700">{stats.label || key}</td>
                  <td className="py-2 px-3 text-right text-stone-500">{stats.count}</td>
                  <td className="py-2 px-3 text-right font-semibold text-[#222222]">{stats.mean}</td>
                  <td className="py-2 px-3 text-right text-stone-500">{stats.median}</td>
                  <td className="py-2 px-3 text-right text-stone-500">{stats.min}</td>
                  <td className="py-2 px-3 text-right text-stone-500">{stats.max}</td>
                  <td className="py-2 px-3 text-right text-stone-500">{stats.stdDev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality category distribution */}
        {data.qualityDistribution?.length > 0 && (
          <SectionCard title="Quality Category Distribution" icon={PieChartIcon}>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.qualityDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {data.qualityDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {/* Score histogram */}
        {data.scoreHistogram?.length > 0 && (
          <SectionCard title="Quality Score Distribution" icon={BarChart3}>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreHistogram}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#6b7280' }} label={{ value: 'Quality Score', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={35} name="Wines" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Grape quality comparison */}
      {data.grapeQualityAvg?.length > 0 && (
        <SectionCard title="Average Quality by Grape Variety" icon={Wine} subtitle="Mean quality score per grape variety">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.grapeQualityAvg.slice(0, 15)} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="grape" tick={{ fontSize: 9, fill: '#6b7280' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgScore" fill="#6D071A" radius={[0, 4, 4, 0]} maxBarSize={16} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Feature vs Quality scatter */}
      {data.featureVsQuality && (
        <SectionCard title="Feature vs Quality Relationships" icon={TrendingUp} subtitle="Scatter plots — correlation does not imply causation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { key: 'pH', label: 'pH vs Quality' },
              { key: 'brix', label: 'Brix/TSS vs Quality' },
              { key: 'totalPhenolics', label: 'Total Phenolics vs Quality' },
              { key: 'titratableAcidity', label: 'Titratable Acidity vs Quality' },
            ].map(({ key, label }) => {
              const points = data.featureVsQuality[key]
              if (!points || points.length === 0) return null
              return (
                <div key={key}>
                  <h4 className="text-xs font-bold text-stone-600 mb-2">{label}</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#6b7280' }} name={key} />
                        <YAxis dataKey="y" tick={{ fontSize: 9, fill: '#6b7280' }} name="Quality" domain={[0, 10]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-[#ECECEC] shadow-lg px-3 py-2 text-xs">
                              <p className="font-semibold text-stone-600">{label}: <span className="font-bold text-[#222222]">{d.x}</span></p>
                              <p className="font-semibold text-stone-600">Quality Score: <span className="font-bold text-[#6D071A]">{d.y}</span></p>
                            </div>
                          )
                        }} />
                        <Scatter data={points} fill="#6D071A" fillOpacity={0.4} r={3} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function CorrelationSection({ data }: { data: any }) {
  if (!data.availability?.available) {
    return <DataNotAvailable message={data.availability?.message || 'Insufficient data for correlation analysis.'} />
  }

  const { qualityCorrelation, engagementCorrelation } = data

  return (
    <div className="space-y-6">
      {/* Correlation Heatmap */}
      {qualityCorrelation && (
        <SectionCard title="Quality Feature Correlation Matrix" icon={Zap} subtitle={qualityCorrelation.note}>
          <div className="overflow-x-auto">
            <table className="text-[10px] border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5"></th>
                  {qualityCorrelation.labels.map((label: string) => (
                    <th key={label} className="p-1.5 font-bold text-stone-500 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minHeight: '80px' }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {qualityCorrelation.matrix.map((row: number[], i: number) => (
                  <tr key={i}>
                    <td className="p-1.5 font-bold text-stone-600 whitespace-nowrap text-right pr-3">{qualityCorrelation.labels[i]}</td>
                    {row.map((val: number, j: number) => (
                      <td key={j} className="p-0">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-[9px] font-bold border border-white/50 rounded-sm"
                          style={{
                            backgroundColor: getHeatmapColor(val),
                            color: Math.abs(val) > 0.5 ? 'white' : '#374151',
                          }}
                          title={`${qualityCorrelation.labels[i]} ↔ ${qualityCorrelation.labels[j]}: ${val}`}
                        >
                          {val.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-3 mt-4 text-[10px] text-stone-500">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(-0.8) }} />
                <span>Strong Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-stone-100" />
                <span>No Correlation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0.8) }} />
                <span>Strong Positive</span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Engagement Correlation */}
      {engagementCorrelation && (
        <SectionCard title="Winery Engagement Correlation" icon={Activity} subtitle={engagementCorrelation.note}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Price ↔ Views', value: engagementCorrelation.priceVsViews },
              { label: 'Price ↔ Saves', value: engagementCorrelation.priceVsSaves },
              { label: 'Views ↔ Saves', value: engagementCorrelation.viewsVsSaves },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 bg-stone-50 rounded-xl border border-[#ECECEC] text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">{label}</p>
                <p className={`text-3xl font-bold ${value > 0.3 ? 'text-emerald-600' : value < -0.3 ? 'text-red-600' : 'text-stone-600'}`}>
                  {value}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">
                  {Math.abs(value) > 0.7 ? 'Strong' : Math.abs(value) > 0.3 ? 'Moderate' : 'Weak'} {value >= 0 ? 'positive' : 'negative'}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-3">Sample size: {engagementCorrelation.sampleSize} wines</p>
        </SectionCard>
      )}
    </div>
  )
}
