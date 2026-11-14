"use client";

import { motion } from "framer-motion";
import { foodPairingCategories } from "@/lib/mock-data/wines";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FoodPairingExplorer() {
  return (
    <section className="py-20 px-6" id="food-pairing" style={{ background: "var(--muted)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <p className="section-tag mb-2">Wine Discovery</p>
            <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
              Explore by Food Pairing
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Find the perfect wine for your favourite dish
            </p>
          </div>
          <Link
            href="/wines"
            className="mt-4 md:mt-0 flex items-center gap-1 text-sm font-semibold text-[#6D071A] dark:text-[#D4AF37] hover:gap-2 transition-all"
          >
            View all pairings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {foodPairingCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
            >
              <Link
                href={`/wines?pairing=${encodeURIComponent(category.name)}`}
                className="group relative rounded-2xl overflow-hidden block aspect-square shadow-md card-lift"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)`,
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-2xl block mb-1">{category.emoji}</span>
                  <p className="text-white font-semibold text-sm">{category.name}</p>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: `${category.color}33` }}
                >
                  <span className="text-white font-bold text-sm px-4 py-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
                    Find Wines →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
