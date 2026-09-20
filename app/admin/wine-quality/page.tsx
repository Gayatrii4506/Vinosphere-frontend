'use client'

import React from 'react'
import { WineQualityLab } from '@/components/lab/WineQualityLab'
import { FlaskConical, ShieldCheck, Sparkles, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminWineQualityPage() {
  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs and title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <FlaskConical size={16} />
            <span>Enological Batch Quality Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Winery Batch Quality Analyzer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Evaluate physicochemical laboratory assays with 90%+ Random Forest accuracy before bottling and cellar release.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/wines"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft size={14} />
            Back to Inventory
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>ML Model Active (v1.2.0)</span>
          </div>
        </div>
      </div>

      {/* Main Integrated Quality Lab */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
        <WineQualityLab />
      </div>
    </div>
  )
}
