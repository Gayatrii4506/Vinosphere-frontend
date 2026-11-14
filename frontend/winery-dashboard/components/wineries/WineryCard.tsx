"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, CheckCircle, Calendar, Heart } from "lucide-react";
import { Winery } from "@/lib/mock-data/wineries";
import { useState } from "react";

interface WineryCardProps {
  winery: Winery;
  index?: number;
}

export default function WineryCard({ winery, index = 0 }: WineryCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
      style={{ background: "var(--card)" }}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={winery.coverImage}
          alt={winery.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {winery.isVerified && (
            <span className="badge-verified flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>

        {/* Trust Score */}
        <div
          className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-bold"
          style={{ background: "rgba(212,175,55,0.9)", color: "#1E1E1E" }}
        >
          TS {winery.trustScore}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold font-serif text-base leading-tight" style={{ color: "var(--foreground)" }}>
            {winery.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{winery.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2" style={{ color: "var(--muted-foreground)" }}>
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs">{winery.location}</span>
        </div>

        <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
          {winery.tagline}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {winery.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{winery.wineCount} Wines</span>
          <span>·</span>
          <span>{winery.experienceCount} Experiences</span>
          {winery.upcomingEventCount > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#6D071A] dark:text-[#D4AF37] font-medium">
                <Calendar className="w-3 h-3" />
                {winery.upcomingEventCount} Events
              </span>
            </>
          )}
        </div>

        <Link
          href={`/wineries/${winery.slug}`}
          className="btn-primary w-full justify-center text-sm rounded-xl"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
}
