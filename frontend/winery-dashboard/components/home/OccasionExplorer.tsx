"use client";

import { motion } from "framer-motion";
import { occasionCategories } from "@/lib/mock-data/wines";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OccasionExplorer() {
  return (
    <section className="py-20 px-6" id="occasions">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-tag mb-2">By Occasion</p>
          <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
            Wine for Every Moment
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Curated wine recommendations for any occasion
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {occasionCategories.map((occasion, index) => (
            <motion.div
              key={occasion.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                href={`/wines?occasion=${encodeURIComponent(occasion.name)}`}
                className="group flex flex-col items-center p-6 rounded-2xl border-2 border-[var(--border)] hover:border-[#6D071A] dark:hover:border-[#D4AF37] transition-all card-lift text-center"
                style={{ background: "var(--card)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: occasion.color + "20" }}
                >
                  {occasion.emoji}
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                  {occasion.name}
                </p>
                <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                  {occasion.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#6D071A] dark:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
