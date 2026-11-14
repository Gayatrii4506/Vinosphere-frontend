"use client";

import { motion } from "framer-motion";
import { events } from "@/lib/mock-data/events";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket, ArrowRight } from "lucide-react";

export default function UpcomingEvents() {
  const upcomingEvents = events.filter((e) => e.isUpcoming).slice(0, 3);

  return (
    <section className="py-20 px-6" id="upcoming-events" style={{ background: "var(--muted)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <p className="section-tag mb-2">Don&apos;t Miss Out</p>
            <h2 className="text-4xl font-bold font-serif" style={{ color: "var(--foreground)" }}>
              Upcoming Events
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Festivals, dinners, workshops, and more
            </p>
          </div>
          <Link
            href="/events"
            className="mt-4 md:mt-0 flex items-center gap-1 text-sm font-semibold text-[#6D071A] dark:text-[#D4AF37] hover:gap-2 transition-all"
          >
            All events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event, index) => {
            const spotsLeft = event.capacity - event.soldCount;
            const soldPercent = (event.soldCount / event.capacity) * 100;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
                style={{ background: "var(--card)" }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: event.isFeatured ? "#D4AF37" : "rgba(255,255,255,0.9)", color: event.isFeatured ? "#1E1E1E" : "#6D071A" }}>
                      {event.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-base font-serif">{event.name}</p>
                    <p className="text-white/70 text-xs">{event.wineryName}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {spotsLeft} spots left
                    </div>
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      From ₹{Number(event.ticketTiers?.[0]?.price ?? 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${soldPercent}%`, background: soldPercent > 80 ? "#ef4444" : "#6D071A" }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      {soldPercent > 80 ? "Almost sold out!" : `${Math.round(soldPercent)}% sold`}
                    </p>
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="btn-primary w-full justify-center rounded-xl text-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Tickets
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
