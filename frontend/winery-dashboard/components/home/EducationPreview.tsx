"use client";

import { motion } from "framer-motion";
import { educationModules } from "@/lib/mock-data/education";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default function EducationPreview() {
  const preview = educationModules.slice(0, 3);
  const difficultyColors: Record<string, string> = {
    Beginner: "#16a34a",
    Intermediate: "#D4AF37",
    Advanced: "#6D071A",
  };

  return (
    <section className="py-20 px-6" id="education-preview">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <p className="section-tag mb-2">Wine Education</p>
            <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
              Learn About Wine
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              From beginner to connoisseur — at your own pace
            </p>
          </div>
          <Link
            href="/learn"
            className="mt-4 md:mt-0 flex items-center gap-1 text-sm font-semibold text-[#6D071A] dark:text-[#D4AF37] hover:gap-2 transition-all"
          >
            View all modules <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {preview.map((module, i) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
              style={{ background: "var(--card)" }}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                <div className="absolute top-3 left-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: difficultyColors[module.difficulty] }}
                  >
                    {module.difficulty}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold font-serif text-sm">{module.title}</p>
                  <p className="text-white/70 text-xs">{module.readTime} · {module.articles.length} articles</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                  {module.description}
                </p>
                <Link href="/learn" className="btn-primary w-full justify-center text-sm rounded-xl">
                  <BookOpen className="w-3.5 h-3.5" />
                  Start Learning
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
