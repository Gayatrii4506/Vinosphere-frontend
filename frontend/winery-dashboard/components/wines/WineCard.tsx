"use client";

import { motion } from "framer-motion";
import { Wine } from "@/lib/mock-data/wines";
import { Star, Heart, Award } from "lucide-react";
import { useState } from "react";
import { resolveWineBottleImage } from "@/lib/api";

interface WineCardProps {
  wine: Wine;
  index?: number;
}

export default function WineCard({ wine, index = 0 }: WineCardProps) {
  const [saved, setSaved] = useState(false);

  const typeColors: Record<string, string> = {
    Red: "#6D071A",
    White: "#D4AF37",
    "Rosé": "#ec4899",
    Sparkling: "#0ea5e9",
    Dessert: "#f59e0b",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
      style={{ background: "var(--card)" }}
    >
      {/* Image */}
      <div className="relative h-56 bg-gradient-to-b from-[#FDF2F4] to-[#FCE7EB] flex items-center justify-center p-4 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute w-24 h-24 rounded-full bg-[#6D071A]/10 blur-xl" />
        <div className="absolute bottom-2 w-20 h-2 bg-black/10 blur-xs rounded-full pointer-events-none" />
        <img
          src={wine.image || resolveWineBottleImage(wine)}
          alt={wine.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = resolveWineBottleImage(wine);
          }}
          className="h-full w-auto max-w-[120px] object-contain drop-shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-108"
        />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: typeColors[wine.type] || "#6D071A" }}
          >
            {wine.type}
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-12 flex flex-col gap-1">
          {wine.awards.length > 0 && (
            <span className="badge-premium flex items-center gap-1">
              <Award className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Save */}
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-sm font-serif line-clamp-1">{wine.name}</p>
          <p className="text-white/70 text-xs">{wine.wineryName} · {wine.vintage}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(wine.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"}`}
              />
            ))}
            <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>{wine.rating}</span>
          </div>
          <span className="text-lg font-bold" style={{ color: "#6D071A" }}>₹{Number(wine.price || 0).toLocaleString()}</span>
        </div>

        {/* Food pairings */}
        <div className="flex flex-wrap gap-1 mb-3">
          {wine.foodPairings.slice(0, 3).map((p) => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              {p}
            </span>
          ))}
        </div>

        {/* Taste profile */}
        <div className="flex flex-wrap gap-1 mb-3">
          {wine.tasteProfile.slice(0, 2).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-[#6D071A]/30" style={{ color: "#6D071A" }}>
              {t}
            </span>
          ))}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className={wine.stock === "Sold Out" ? "text-red-500" : wine.stock === "Limited" ? "text-amber-500" : "text-green-600"}>
            ● {wine.stock}
          </span>
          <span>{wine.alcoholContent}</span>
        </div>
      </div>
    </motion.div>
  );
}
