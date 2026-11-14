"use client";

import { motion } from "framer-motion";
import { wines } from "@/lib/mock-data/wines";
import { Star, Heart, ShoppingBag, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WineOfDay() {
  const wineOfDay = wines.find((w) => w.isWineOfDay)!;
  const wineOfMonth = wines.find((w) => w.isWineOfMonth)!;
  const [savedDay, setSavedDay] = useState(false);
  const [savedMonth, setSavedMonth] = useState(false);

  return (
    <section className="py-20 px-6" id="wine-of-day">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="section-tag mb-2">Daily Picks</p>
          <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
            Wine of the Day & Month
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Wine of the Day */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg card-lift"
            style={{ background: "var(--card)" }}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={wineOfDay.image}
                alt={wineOfDay.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
              <div className="absolute top-4 left-4">
                <span className="badge-premium">🌟 Wine of the Day</span>
              </div>
              <button
                onClick={() => setSavedDay(!savedDay)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <Heart className={`w-4 h-4 ${savedDay ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white font-bold text-lg font-serif">{wineOfDay.name}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                    {wineOfDay.wineryName} · {wineOfDay.vintage}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(wineOfDay.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>
                      {wineOfDay.rating} ({wineOfDay.reviewCount})
                    </span>
                  </div>
                </div>
                <span className="text-xl font-bold" style={{ color: "#6D071A" }}>
                  ₹{Number(wineOfDay?.price || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                {wineOfDay.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {wineOfDay.foodPairings.slice(0, 3).map((p) => (
                  <span key={p} className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {p}
                  </span>
                ))}
              </div>
              <Link
                href={`/wines`}
                className="btn-primary w-full justify-center rounded-xl"
              >
                <ShoppingBag className="w-4 h-4" />
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Wine of the Month */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-gold card-lift"
            style={{ background: "linear-gradient(135deg, #6D071A 0%, #3d020d 100%)" }}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={wineOfMonth.image}
                alt={wineOfMonth.name}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(212,175,55,0.2)", border: "2px solid #D4AF37" }}>
                  <Award className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Wine of the Month</span>
                <h3 className="text-white font-serif font-bold text-2xl mt-2">{wineOfMonth.name}</h3>
                <p className="text-white/70 text-sm mt-1">{wineOfMonth.vintage} · {wineOfMonth.wineryName}</p>
              </div>
              <button
                onClick={() => setSavedMonth(!savedMonth)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Heart className={`w-4 h-4 ${savedMonth ? "fill-red-400 text-red-400" : "text-white/70"}`} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(wineOfMonth.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/20"}`}
                  />
                ))}
                <span className="text-xs text-white/70 ml-1">{wineOfMonth.rating} ({wineOfMonth.reviewCount} reviews)</span>
              </div>
              <p className="text-sm text-white/80 mb-3 line-clamp-2">{wineOfMonth.description}</p>
              {wineOfMonth.awards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {wineOfMonth.awards.map((a) => (
                    <span key={a} className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                      🏆 {a}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#D4AF37]">₹{Number(wineOfMonth?.price || 0).toLocaleString()}</span>
                <Link href="/wines" className="btn-gold rounded-xl">
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
