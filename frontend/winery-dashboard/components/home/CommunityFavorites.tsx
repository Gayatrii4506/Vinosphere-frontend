"use client";

import { motion } from "framer-motion";
import { wines } from "@/lib/mock-data/wines";
import { Star, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function CommunityFavorites() {
  const favorites = wines.filter((w) => w.isCommunityFavorite).slice(0, 6);
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section className="py-20 px-6" id="community-favorites">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div>
            <p className="section-tag mb-2">Community Picks</p>
            <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
              Community Favorites
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Most loved wines on VinoSphere</p>
          </div>
          <Link href="/wines" className="mt-4 md:mt-0 flex items-center gap-1 text-sm font-semibold text-[#6D071A] dark:text-[#D4AF37] hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {favorites.map((wine, index) => (
            <motion.div
              key={wine.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="group relative rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
              style={{ background: "var(--card)" }}
            >
              <div className="relative h-36 overflow-hidden">
                <img src={wine.image} alt={wine.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button
                  onClick={() => toggleSave(wine.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  <Heart className={`w-3.5 h-3.5 ${saved.includes(wine.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold line-clamp-1 mb-0.5" style={{ color: "var(--foreground)" }}>{wine.name}</p>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{wine.type}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{wine.rating}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#6D071A" }}>₹{Number(wine.price || 0).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
