"use client";

import { motion } from "framer-motion";
import { Leaf, Droplets, Sun, Recycle, TreePine, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { icon: Leaf, label: "Organic Wineries", value: "3", color: "#16a34a" },
  { icon: Sun, label: "Solar Powered", value: "80%", color: "#D4AF37" },
  { icon: Droplets, label: "Water Saved", value: "40%", color: "#0ea5e9" },
  { icon: TreePine, label: "Trees Planted", value: "10K+", color: "#15803d" },
];

const practices = [
  { title: "Organic Viticulture", desc: "3 of our partner wineries are fully certified organic, eliminating synthetic pesticides and fertilizers.", icon: Leaf, color: "#16a34a" },
  { title: "Solar Energy", desc: "Sula Vineyards runs 80% of operations on solar power, pioneering renewable energy in Indian viticulture.", icon: Sun, color: "#D4AF37" },
  { title: "Water Conservation", desc: "Advanced drip irrigation and rainwater harvesting save up to 40% more water versus traditional methods.", icon: Droplets, color: "#0ea5e9" },
  { title: "Zero Waste", desc: "Grape pomace is composted, glass is recycled, and plastic-free initiatives are spreading across wineries.", icon: Recycle, color: "#6D071A" },
];

export default function SustainabilitySection() {
  return (
    <section
      className="py-20 px-6 relative overflow-hidden"
      id="sustainability"
      style={{ background: "linear-gradient(135deg, #0f1c0f 0%, #1a2e1a 50%, #0d1f0d 100%)" }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #16a34a, transparent)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-2">Sustainable Future</p>
          <h2 className="text-4xl font-bold font-serif text-white">
            Wine with Responsibility
          </h2>
          <p className="mt-3 text-green-200/70 max-w-xl mx-auto text-sm">
            VinoSphere champions sustainable winemaking. Every winery on our platform is evaluated for environmental responsibility.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: stat.color + "30" }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold font-serif text-white">{stat.value}</p>
                <p className="text-xs text-green-200/70 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Practices Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {practices.map((practice, i) => {
            const Icon = practice.icon;
            return (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: practice.color + "30" }}
                >
                  <Icon className="w-5 h-5" style={{ color: practice.color }} />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{practice.title}</h3>
                <p className="text-green-200/60 text-xs leading-relaxed">{practice.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/wineries?sustainable=true" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:gap-3" style={{ background: "rgba(22,163,74,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
            <Leaf className="w-4 h-4" />
            Explore Sustainable Wineries
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
