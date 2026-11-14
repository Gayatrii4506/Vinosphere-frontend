'use client'

import React, { useState } from 'react'
import {
  VinoCard,
  VinoButton,
  VinoBadge,
  VinoInput,
  VinoGauge,
} from '@/components/ui'
import { Search, Heart, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Wine, Filter } from 'lucide-react'

export default function DesignShowcasePage() {
  const [inputValue, setInputValue] = useState('')
  const [errorInput, setErrorInput] = useState('')
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [gaugeScore, setGaugeScore] = useState(88)

  const handleSimulateAction = () => {
    setLoadingBtn(true)
    setTimeout(() => setLoadingBtn(false), 1500)
  }

  return (
    <div className="min-h-screen bg-[#0A0609] text-stone-100 p-6 md:p-12 space-y-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto space-y-3 border-b border-stone-800 pb-8">
        <div className="flex items-center space-x-3">
          <Wine className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">
            VinoSphere Grand Cru <span className="text-[#D4AF37]">Design Showcase</span>
          </h1>
        </div>
        <p className="text-stone-400 text-sm md:text-base max-w-2xl">
          Visual preview of the Phase 1 reusable component primitives (`VinoCard`, `VinoButton`, `VinoBadge`, `VinoInput`, `VinoGauge`).
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-16">
        {/* 1. VinoButton Showcase */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#721832] pl-4">
            <h2 className="text-xl font-serif font-semibold text-white">1. VinoButton Component</h2>
            <p className="text-xs text-stone-400">Buttons with tactile hover scales, focus outlines, loading states, and variant themes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary & Secondary */}
            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Primary & Secondary</h3>
              <div className="flex flex-wrap gap-3">
                <VinoButton variant="primary">Primary Burgundy</VinoButton>
                <VinoButton variant="secondary-gold">Champagne Gold</VinoButton>
              </div>
            </VinoCard>

            {/* Outline, Ghost & Danger */}
            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Outline, Ghost & Danger</h3>
              <div className="flex flex-wrap gap-3">
                <VinoButton variant="outline">Outline Gold</VinoButton>
                <VinoButton variant="ghost">Ghost Neutral</VinoButton>
                <VinoButton variant="danger">Danger Action</VinoButton>
              </div>
            </VinoCard>

            {/* Sizes & Interactive Loading */}
            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Sizes & Loading State</h3>
              <div className="flex flex-wrap items-center gap-3">
                <VinoButton variant="primary" size="sm">Small</VinoButton>
                <VinoButton variant="primary" size="md">Medium</VinoButton>
                <VinoButton variant="primary" size="lg">Large</VinoButton>
              </div>
              <div className="pt-2">
                <VinoButton
                  variant="secondary-gold"
                  fullWidth
                  isLoading={loadingBtn}
                  onClick={handleSimulateAction}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  {loadingBtn ? 'Processing Action...' : 'Click to Test Loading State'}
                </VinoButton>
              </div>
            </VinoCard>
          </div>
        </section>

        {/* 2. VinoCard Showcase */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#D4AF37] pl-4">
            <h2 className="text-xl font-serif font-semibold text-white">2. VinoCard Component</h2>
            <p className="text-xs text-stone-400">Card surface containers with glass blur, gold ring highlights, and elevation hover states.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VinoCard variant="surface" hoverEffect>
              <h4 className="font-serif font-bold text-lg text-white mb-2">Surface Variant</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Clean dark surface with subtle stone border. Hover over this card to test elevation.
              </p>
            </VinoCard>

            <VinoCard variant="glass" hoverEffect>
              <h4 className="font-serif font-bold text-lg text-[#D4AF37] mb-2">Glass Variant</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Selective glassmorphic backdrop blur with subtle opacity fill for luxury feel.
              </p>
            </VinoCard>

            <VinoCard variant="bordered" hoverEffect>
              <h4 className="font-serif font-bold text-lg text-white mb-2">Bordered Variant</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                High-contrast border for structured list items or analytical data panels.
              </p>
            </VinoCard>

            <VinoCard variant="gold-accent" hoverEffect>
              <h4 className="font-serif font-bold text-lg text-[#F3E5AB] mb-2">Gold Accent Variant</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Champagne Gold stroke & ring highlight for featured wines and top tier items.
              </p>
            </VinoCard>
          </div>
        </section>

        {/* 3. VinoBadge Showcase */}
        <section className="space-y-6">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h2 className="text-xl font-serif font-semibold text-white">3. VinoBadge Component</h2>
            <p className="text-xs text-stone-400">Status pills with optional indicator dots for category classification and verification status.</p>
          </div>

          <VinoCard variant="surface" className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Standard Badges</h3>
              <div className="flex flex-wrap gap-3">
                <VinoBadge variant="burgundy">Cabernet Sauvignon</VinoBadge>
                <VinoBadge variant="gold">Vintage 2018</VinoBadge>
                <VinoBadge variant="success">Grand Cru Verified</VinoBadge>
                <VinoBadge variant="warning">Low Stock (3 remaining)</VinoBadge>
                <VinoBadge variant="info">Tasting Event Open</VinoBadge>
                <VinoBadge variant="neutral">Single Estate</VinoBadge>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-stone-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Badges with Live Dot Indicators</h3>
              <div className="flex flex-wrap gap-3">
                <VinoBadge variant="burgundy" dot>Private Cellar</VinoBadge>
                <VinoBadge variant="gold" dot>96 Points (Decanter)</VinoBadge>
                <VinoBadge variant="success" dot>In Stock</VinoBadge>
                <VinoBadge variant="warning" dot>Pending Approval</VinoBadge>
                <VinoBadge variant="info" dot>Live Tasting</VinoBadge>
              </div>
            </div>
          </VinoCard>
        </section>

        {/* 4. VinoInput Showcase */}
        <section className="space-y-6">
          <div className="border-l-4 border-sky-500 pl-4">
            <h2 className="text-xl font-serif font-semibold text-white">4. VinoInput Component</h2>
            <p className="text-xs text-stone-400">Accessible form inputs with gold focus highlights, error validation styling, and icon triggers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Standard Input</h3>
              <VinoInput
                label="Search Cellar Inventory"
                placeholder="e.g. Sula Shiraz, Pinot Noir..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Type any wine variety, region or vintage."
              />
            </VinoCard>

            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Input with Leading Icon</h3>
              <VinoInput
                label="Filter Wineries by Name"
                placeholder="Search winery..."
                icon={<Search className="w-4 h-4 text-[#D4AF37]" />}
              />
            </VinoCard>

            <VinoCard variant="surface" className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Input with Error State</h3>
              <VinoInput
                label="Physicochemical pH Level"
                placeholder="Enter pH (e.g. 3.4)"
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                error={errorInput.length === 0 ? 'pH value is required for quality prediction.' : undefined}
              />
            </VinoCard>
          </div>
        </section>

        {/* 5. VinoGauge Showcase */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#D4AF37] pl-4">
            <h2 className="text-xl font-serif font-semibold text-white">5. VinoGauge Component</h2>
            <p className="text-xs text-stone-400">Radial SVG progress gauges for ML Wine Quality Scores and AI Food Pairing Match Percentages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VinoCard variant="gold-accent" className="flex flex-col items-center justify-center p-8 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Wine Quality Score</h3>
              <VinoGauge
                score={gaugeScore}
                maxScore={100}
                label="Quality Grade"
                sublabel="Exceptional Vintage"
                variant="quality"
                size={160}
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setGaugeScore(Math.max(30, gaugeScore - 10))}
                  className="px-3 py-1 bg-stone-800 text-xs rounded hover:bg-stone-700"
                >
                  Score -10
                </button>
                <button
                  onClick={() => setGaugeScore(Math.min(100, gaugeScore + 10))}
                  className="px-3 py-1 bg-stone-800 text-xs rounded hover:bg-stone-700"
                >
                  Score +10
                </button>
              </div>
            </VinoCard>

            <VinoCard variant="surface" className="flex flex-col items-center justify-center p-8 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">AI Food Match Score</h3>
              <VinoGauge
                score={94}
                maxScore={100}
                label="Flavor Pairing Match"
                sublabel="Grilled Lamb & Cabernet"
                variant="gold"
                size={160}
              />
            </VinoCard>

            <VinoCard variant="surface" className="flex flex-col items-center justify-center p-8 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Compact Badge Gauge</h3>
              <VinoGauge
                score={78}
                maxScore={100}
                label="Acidity Harmony"
                sublabel="Balanced Tannins"
                variant="burgundy"
                size={130}
              />
            </VinoCard>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
        VinoSphere Grand Cru Design Showcase • Dev Preview Route (`/design-showcase`)
      </footer>
    </div>
  )
}
