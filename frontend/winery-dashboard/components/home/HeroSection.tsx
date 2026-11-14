"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/wines?q=${encodeURIComponent(query)}`);
  };

  const suggestions = [
    "Butter Chicken Pairing",
    "Sula Shiraz",
    "SulaFest Tickets",
    "Vineyard Tours",
    "Nashik Wine Tours",
  ];

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=85"
          alt="Nashik vineyards at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-sm text-white/90"
        >
          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
          Nashik, MH - Wine Capital of India
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6"
        >
          Discover Nashik&apos;s
          <br />
          <span className="text-gradient-gold">Wine World</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Explore wineries, discover wines, attend events, and experience wine
          tourism in the heart of Nashik.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mb-4"
        >
          <div className="flex items-center glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <Search className="w-5 h-5 text-[#6D071A] ml-5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wineries, wines, events, food pairings..."
              className="flex-1 px-4 py-4 bg-transparent text-[#1E1E1E] placeholder-gray-500 text-sm outline-none"
              id="hero-search"
            />
            <button
              type="submit"
              className="btn-primary m-2 rounded-xl shrink-0"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        {/* Quick Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => router.push(`/wines?q=${encodeURIComponent(s)}`)}
              className="text-xs px-3 py-1.5 rounded-full glass text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              {s}
            </button>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/wineries" className="btn-primary text-base px-8 py-3 rounded-xl">
            Explore Wineries
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/experiences"
            className="btn-outline text-base px-8 py-3 rounded-xl border-white/40 text-white hover:bg-white/10 hover:border-white/60"
          >
            Browse Experiences
          </Link>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { value: "10+", label: "Premium Wineries" },
            { value: "30+", label: "Wines Curated" },
            { value: "5", label: "Upcoming Events" },
            { value: "4.7", label: "Avg Rating", icon: <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" /> },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1">
                {stat.icon}
                <span className="text-3xl font-bold text-white font-serif">{stat.value}</span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
}
