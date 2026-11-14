"use client";

import { motion } from "framer-motion";
import { wineries } from "@/lib/mock-data/wineries";
import Link from "next/link";
import { Star, MapPin, Award, CheckCircle, ArrowRight, Wine } from "lucide-react";

export default function FeaturedWinery() {
  const featured = wineries[0]; // Sula Vineyards

  return (
    <section className="py-20 px-6" id="featured-winery">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-tag mb-2">Spotlight</p>
          <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
            Featured Winery
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl"
          style={{ background: "var(--card)" }}
        >
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 lg:h-auto overflow-hidden">
              <img
                src={featured.coverImage}
                alt={featured.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.2))" }} />
              {/* Trust Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: "rgba(255,255,255,0.95)", color: "#6D071A" }}>
                <CheckCircle className="w-4 h-4" />
                Verified Winery
              </div>
            </div>

            {/* Info */}
            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="section-tag">India&apos;s Most Iconic Winery</span>
              </div>
              <h3 className="text-3xl font-bold font-serif mb-2" style={{ color: "var(--foreground)" }}>
                {featured.name}
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6D071A] dark:text-[#D4AF37]" />
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{featured.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{featured.rating}</span>
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>({(featured?.reviewCount || 0).toLocaleString()} reviews)</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
                {featured.story.substring(0, 250)}...
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Wines", value: featured.wineCount + "+" },
                  { label: "Experiences", value: featured.experienceCount + "+" },
                  { label: "Est.", value: featured.established },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                    <p className="text-xl font-bold font-serif" style={{ color: "#6D071A" }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Awards */}
              {featured.awards.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {featured.awards.slice(0, 3).map((award) => (
                    <span
                      key={award}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-[#D4AF37]/40"
                      style={{ color: "#b8911f", background: "rgba(212,175,55,0.1)" }}
                    >
                      <Award className="w-3 h-3" />
                      {award}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {featured.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/wineries/${featured.slug}`}
                  className="btn-primary rounded-xl"
                >
                  <Wine className="w-4 h-4" />
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/wineries"
                  className="btn-outline rounded-xl"
                >
                  All Wineries
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
