"use client";

import { motion } from "framer-motion";
import { Mail, Wine, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      id="newsletter"
      style={{ background: "linear-gradient(135deg, #6D071A 0%, #3d020d 50%, #6D071A 100%)" }}
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4AF37, transparent)", transform: "translate(-50%, -50%)" }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4AF37, transparent)", transform: "translate(50%, 50%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.3)" }}
        >
          <Wine className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">Stay in the loop</p>
        <h2 className="text-4xl font-bold font-serif text-white mb-4">
          Join the VinoSphere
          <br />
          <span style={{ color: "#D4AF37" }}>Wine Community</span>
        </h2>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          Get curated wine recommendations, exclusive event access, winery stories, and food pairing guides delivered to your inbox every week.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
                id="newsletter-email"
              />
            </div>
            <button type="submit" className="btn-gold rounded-xl shrink-0">
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-4 rounded-2xl text-white"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
          >
            <p className="text-[#D4AF37] font-semibold mb-1">🍷 Welcome to the community!</p>
            <p className="text-white/80 text-sm">Thank you! You&apos;ll receive our first newsletter shortly.</p>
          </motion.div>
        )}

        <p className="text-white/40 text-xs mt-4">
          Join 12,000+ wine lovers across India. Unsubscribe anytime.
        </p>
      </motion.div>
    </section>
  );
}
