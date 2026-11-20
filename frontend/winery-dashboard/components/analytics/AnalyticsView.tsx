'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Eye, Bookmark, MousePointer, CalendarCheck, Lightbulb } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsView() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Determine winery ID from user context/local storage (simulate for now)
                const wineryId = localStorage.getItem('winery_id') || '00000000-0000-0000-0000-000000000000'
                const token = localStorage.getItem('token')

                // For the sake of UI development when backend is missing
                // In production this will fetch from API_V1_URL/analytics/winery/:wineryId
                const res = await fetch(`http://localhost:5000/api/v1/analytics/winery/${wineryId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                
                if (res.ok) {
                    const data = await res.json()
                    setAnalytics(data.data)
                } else {
                    throw new Error('Failed to fetch analytics')
                }
            } catch (err) {
                // Fallback mock data for presentation if backend connection fails
                setAnalytics({
                    kpis: {
                        total_wine_views: 12450,
                        total_wine_saves: 342,
                        recommendation_clicks: 89,
                        event_views: 530,
                        event_bookings: 45
                    },
                    top_wines: [
                        { name: "Rasa Shiraz", views: 2450, saves: 112, save_rate: 4.5 },
                        { name: "Dindori Reserve", views: 1800, saves: 98, save_rate: 5.4 },
                        { name: "Chenin Blanc", views: 1540, saves: 45, save_rate: 2.9 }
                    ],
                    insights: [
                        "Wine engagement has increased compared with the previous period.",
                        "\"Rasa Shiraz\" is receiving strong customer interest based on views and saves."
                    ]
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-10 w-[250px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-[120px] rounded-xl" />
                    <Skeleton className="h-[120px] rounded-xl" />
                    <Skeleton className="h-[120px] rounded-xl" />
                    <Skeleton className="h-[120px] rounded-xl" />
                </div>
            </div>
        )
    }

    const { kpis, top_wines, insights } = analytics

    // Format top wines for the chart
    const chartData = top_wines?.map((w: any) => ({
        name: w.name,
        views: w.views,
        saves: w.saves
    })) || []

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics & Business Insights</h1>
                <p className="text-stone-500">Monitor engagement and discover actionable insights about your winery's performance.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Wine Views</CardTitle>
                        <Eye className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.total_wine_views?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Wine Saves</CardTitle>
                        <Bookmark className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.total_wine_saves?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Event Views</CardTitle>
                        <Activity className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.event_views?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Event Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.event_bookings?.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actionable Insights */}
                <Card className="lg:col-span-1 border-vino-accent/20 bg-stone-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-vino-accent" />
                            Actionable Insights
                        </CardTitle>
                        <CardDescription>Rule-based business insights derived from your analytics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insights?.map((insight: string, idx: number) => (
                            <div key={idx} className="p-4 bg-white rounded-lg border border-stone-100 shadow-sm text-sm text-stone-700 leading-relaxed">
                                {insight}
                            </div>
                        ))}
                        {(!insights || insights.length === 0) && (
                            <div className="text-sm text-stone-500 italic">Not enough data to generate insights at this time.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performing Wines Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Performing Wines</CardTitle>
                        <CardDescription>Comparison of views and saves for your most popular wines.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="views" fill="#6D071A" radius={[4, 4, 0, 0]} name="Views" maxBarSize={40} />
                                    <Bar dataKey="saves" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Saves" maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
