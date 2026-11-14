"use client";

import { motion } from "framer-motion";
import { Experience } from "@/lib/mock-data/experiences";
import { Clock, Users, Star, MapPin } from "lucide-react";
import Link from "next/link";

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

export default function ExperienceCard({ experience, index = 0 }: ExperienceCardProps) {
  const categoryColors: Record<string, string> = {
    "Vineyard Tour": "#16a34a",
    "Wine Tasting": "#6D071A",
    "Food Pairing": "#f59e0b",
    "Workshop": "#7c3aed",
    "Harvest": "#D4AF37",
    "Cellar Tour": "#0ea5e9",
  };

  const spotsLeft = experience.maxGuests - (experience.maxGuests - experience.availableSeats);
  const isScarce = experience.availableSeats <= 3;
  const displayImg = experience.image || (
    experience.name?.toLowerCase().includes('vip') || experience.name?.toLowerCase().includes('barrel')
      ? 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&auto=format&fit=crop&q=80'
      : experience.name?.toLowerCase().includes('masterclass') || experience.name?.toLowerCase().includes('cellar')
        ? 'https://images.unsplash.com/photo-1528823872057-9c018a7a70b3?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
      style={{ background: "var(--card)" }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={displayImg}
          alt={experience.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />

        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: categoryColors[experience.category] }}
          >
            {experience.category}
          </span>
        </div>

        {isScarce && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: "#ef4444" }}>
              Only {experience.availableSeats} left!
            </span>
          </div>
        )}

        {experience.isPopular && (
          <div className="absolute top-3 right-3">
            <span className="badge-premium">⭐ Popular</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-base font-serif">{experience.name}</p>
          <p className="text-white/70 text-xs">{experience.wineryName}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {experience.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Max {experience.maxGuests} guests
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {experience.location.split(",")[0]}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            {experience.rating} ({experience.reviewCount})
          </div>
        </div>

        <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
          {experience.description}
        </p>

        {/* Includes */}
        <div className="flex flex-wrap gap-1 mb-4">
          {experience.includes.slice(0, 3).map((item) => (
            <span key={item} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              ✓ {item}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold" style={{ color: "#6D071A" }}>₹{Number(experience.price || 0).toLocaleString()}</span>
            <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>/{experience.priceUnit}</span>
          </div>
          <button className="btn-primary rounded-xl text-sm">
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
