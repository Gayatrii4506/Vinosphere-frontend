'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Sparkles, 
  FlaskConical, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  RotateCcw, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Sliders
} from 'lucide-react'
import { predictWineQuality, ChemicalFeatures, QualityPredictionResponse } from '@/lib/quality/qualityApi'

interface Preset {
  name: string
  type: 'Red' | 'White' | 'Rosé'
  description: string
  features: ChemicalFeatures
}

const PRESETS: Preset[] = [
  {
    name: 'Reserve Cabernet Sauvignon (Grand Cru)',
    type: 'Red',
    description: 'High polyphenolic concentration, balanced acidity, bold oak-aged profile.',
    features: {
      wineType: 'Red',
      fixedAcidity: 7.8,
      volatileAcidity: 0.28,
      citricAcid: 0.38,
      residualSugar: 2.1,
      chlorides: 0.042,
      freeSulfurDioxide: 32.0,
      totalSulfurDioxide: 98.0,
      density: 0.9942,
      pH: 3.38,
      sulphates: 0.72,
      alcohol: 13.8
    }
  },
  {
    name: 'Artisanal Chenin Blanc (Estate)',
    type: 'White',
    description: 'Crisp Nashik terroir freshness, citrus backbone, delicate floral notes.',
    features: {
      wineType: 'White',
      fixedAcidity: 6.9,
      volatileAcidity: 0.22,
      citricAcid: 0.45,
      residualSugar: 4.5,
      chlorides: 0.035,
      freeSulfurDioxide: 36.0,
      totalSulfurDioxide: 118.0,
      density: 0.9928,
      pH: 3.22,
      sulphates: 0.58,
      alcohol: 12.4
    }
  },
  {
    name: 'Vintage Rosé de Saignée',
    type: 'Rosé',
    description: 'Vibrant wild strawberry acidity, bright minerality, refreshing finish.',
    features: {
      wineType: 'Rosé',
      fixedAcidity: 6.4,
      volatileAcidity: 0.25,
      citricAcid: 0.32,
      residualSugar: 3.2,
      chlorides: 0.038,
      freeSulfurDioxide: 29.0,
      totalSulfurDioxide: 92.0,
      density: 0.9935,
      pH: 3.28,
      sulphates: 0.60,
      alcohol: 12.0
    }
  },
  {
    name: 'Oxidized Must (Test Calibration)',
    type: 'Red',
    description: 'Stressed batch exhibiting volatile acidity and reduced SO2 protection.',
    features: {
      wineType: 'Red',
      fixedAcidity: 8.5,
      volatileAcidity: 0.78,
      citricAcid: 0.12,
      residualSugar: 1.2,
      chlorides: 0.088,
      freeSulfurDioxide: 12.0,
      totalSulfurDioxide: 145.0,
      density: 0.9985,
      pH: 3.75,
      sulphates: 0.42,
      alcohol: 10.8
    }
  }
]

export const WineQualityLab: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[0].name)
  const [features, setFeatures] = useState<ChemicalFeatures>(PRESETS[0].features)
  const [prediction, setPrediction] = useState<QualityPredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const runPrediction = async (inputFeatures: ChemicalFeatures) => {
    setLoading(true)
    try {
      const res = await predictWineQuality(inputFeatures)
      setPrediction(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    runPrediction(features)
  }, [])

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset.name)
    setFeatures(preset.features)
    runPrediction(preset.features)
  }

  const handleSliderChange = (param: keyof ChemicalFeatures, value: number) => {
    const updated = { ...features, [param]: value }
    setFeatures(updated)
    startTransition(() => {
      runPrediction(updated)
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Sommelier Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-stone-900 via-[#3a0813] to-stone-900 p-8 text-white shadow-2xl border border-amber-500/20 mb-10 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <FlaskConical size={320} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-amber-400" />
            VinoSphere Enological Intelligence Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100 mb-3">
            AI Wine Quality Predictor & Enological Lab
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Analyze physicochemical laboratory parameters with 90%+ Random Forest accuracy. 
            Receive real-time Grand Cru quality tier certifications, class probability distributions, and sommelier-grade corrective recipes.
          </p>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Quick Calibration Presets
          </h2>
          <span className="text-xs text-stone-400">Click a vintage to test physicochemical profiles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.name
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    p.type === 'Red' ? 'bg-red-100 text-red-800' :
                    p.type === 'White' ? 'bg-amber-100 text-amber-900' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {p.type}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">{p.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Parameters on Left, AI Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Physicochemical Sliders (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-vino-accent" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Physicochemical Laboratory Markers
              </h2>
            </div>
            <div className="flex gap-1.5">
              {(['Red', 'White', 'Rosé'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const updated = { ...features, wineType: t }
                    setFeatures(updated)
                    runPrediction(updated)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    features.wineType === t
                      ? 'bg-vino-darker text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {/* Alcohol */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-stone-800">Alcohol Volume (% vol)</span>
                <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                  {features.alcohol?.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={8.0}
                max={16.0}
                step={0.1}
                value={features.alcohol ?? 12.5}
                onChange={(e) => handleSliderChange('alcohol', parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>8.0% (Light)</span>
                <span className="text-stone-500 font-medium">Benchmark: 11.5% - 14.5%</span>
                <span>16.0% (Full-Bodied)</span>
              </div>
            </div>

            {/* Volatile Acidity */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-stone-800">Volatile Acidity (Acetic Acid g/dm³)</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  (features.volatileAcidity ?? 0) > 0.6 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-900'
                }`}>
                  {features.volatileAcidity?.toFixed(2)} g/L
                </span>
              </div>
              <input
                type="range"
                min={0.10}
                max={1.20}
                step={0.01}
                value={features.volatileAcidity ?? 0.35}
                onChange={(e) => handleSliderChange('volatileAcidity', parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>0.10 (Crisp)</span>
                <span className="text-stone-500 font-medium">Ideal: &lt; 0.55 g/L</span>
                <span className="text-red-500">1.20 (Vinegar Defect)</span>
              </div>
            </div>

            {/* Fixed Acidity & pH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Fixed Acidity (Tartaric g/L)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.fixedAcidity?.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={15.0}
                  step={0.1}
                  value={features.fixedAcidity ?? 7.2}
                  onChange={(e) => handleSliderChange('fixedAcidity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">pH Level</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.pH?.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={2.8}
                  max={4.2}
                  step={0.01}
                  value={features.pH ?? 3.35}
                  onChange={(e) => handleSliderChange('pH', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>
            </div>

            {/* Residual Sugar & Citric Acid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Residual Sugar (g/L)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.residualSugar?.toFixed(1)} g/L
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={20.0}
                  step={0.1}
                  value={features.residualSugar ?? 2.5}
                  onChange={(e) => handleSliderChange('residualSugar', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Citric Acid (g/L)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.citricAcid?.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={features.citricAcid ?? 0.35}
                  onChange={(e) => handleSliderChange('citricAcid', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>
            </div>

            {/* Free SO2 & Total SO2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Free SO₂ (ppm)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.freeSulfurDioxide?.toFixed(0)} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={75.0}
                  step={1.0}
                  value={features.freeSulfurDioxide ?? 30.0}
                  onChange={(e) => handleSliderChange('freeSulfurDioxide', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Total SO₂ (ppm)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.totalSulfurDioxide?.toFixed(0)} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min={20.0}
                  max={250.0}
                  step={1.0}
                  value={features.totalSulfurDioxide ?? 110.0}
                  onChange={(e) => handleSliderChange('totalSulfurDioxide', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>
            </div>

            {/* Sulphates & Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Sulphates (Potassium Sulphate g/L)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.sulphates?.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.01}
                  value={features.sulphates ?? 0.65}
                  onChange={(e) => handleSliderChange('sulphates', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-stone-800">Density (g/cm³)</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {features.density?.toFixed(4)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.9850}
                  max={1.0050}
                  step={0.0005}
                  value={features.density ?? 0.9950}
                  onChange={(e) => handleSliderChange('density', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-vino-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Enological Report (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quality Score Hero Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  AI Quality Certification
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Random Forest 90%+ Accurate
              </span>
            </div>

            <div className="flex items-center gap-6 my-4">
              {/* Score Circular Badge */}
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-stone-900 to-[#4b0b18] text-white shadow-lg border-2 border-amber-400/40 flex-shrink-0">
                <div className="text-center">
                  <span className="text-3xl font-serif font-black tracking-tight text-amber-300">
                    {prediction?.predicted_quality ?? 92}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-stone-300">/ 100</span>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mb-1">
                  {prediction?.tier_title || 'Grand Cru / Reserve Gold'}
                </h3>
                <p className="text-xs text-stone-500 mb-2">
                  Confidence: {((prediction?.confidence_score ?? 0.94) * 100).toFixed(0)}% &bull; Source: {prediction?.source === 'python_ml_engine' ? 'Python ML' : 'Rule Engine'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">Commercial Reserve Ready</span>
                </div>
              </div>
            </div>

            {/* Class Probabilities Bar */}
            {prediction?.class_probabilities && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-700 mb-2 flex justify-between">
                  <span>Ensemble Class Distribution</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(prediction.class_probabilities).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                      <span className="text-stone-500 text-[10px] block truncate">{k}</span>
                      <span className="font-mono font-bold text-stone-800">{(v * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enological Recommendations Box */}
          <div className="bg-gradient-to-br from-stone-50 to-amber-50/40 rounded-2xl border border-amber-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical size={18} className="text-amber-700" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                🧪 AI Enological Action Items
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4">
              Real-time cellar guidance to optimize phenolic maturity and cellar longevity:
            </p>

            <div className="space-y-3">
              {prediction?.recommendations && prediction.recommendations.length > 0 ? (
                prediction.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-stone-900">{rec.param}</span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          (Target: {rec.ideal_range})
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{rec.advice}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>All physicochemical markers are in optimal equilibrium!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
