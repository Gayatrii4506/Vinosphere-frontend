"use client";

import { motion } from "framer-motion";
import { Event } from "@/lib/mock-data/events";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const soldPercent = (event.soldCount / event.capacity) * 100;
  const spotsLeft = event.capacity - event.soldCount;
  const isAlmostFull = soldPercent > 75;
  const displayImg = event.coverImage || (event as any).image || (event as any).image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group rounded-2xl overflow-hidden border border-[var(--border)] card-lift"
      style={{ background: "var(--card)" }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={displayImg}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }} />

        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: event.isFeatured ? "#D4AF37" : "rgba(255,255,255,0.9)", color: event.isFeatured ? "#1E1E1E" : "#6D071A" }}
          >
            {event.type}
          </span>
          {event.isFeatured && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(109,7,26,0.8)", color: "white" }}>
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg font-serif mb-0.5">{event.name}</p>
          <p className="text-white/70 text-xs">{event.wineryName}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.location.split(",")[0]}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {(spotsLeft ?? 0).toLocaleString()} spots left
          </div>
          <div className="flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" />
            From ₹{Number(event.ticketTiers?.[0]?.price ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Sold bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
            <span>{isAlmostFull ? "🔥 Almost sold out!" : `${Math.round(soldPercent)}% filled`}</span>
            <span>{Number(event.soldCount ?? 0).toLocaleString()} sold</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${soldPercent}%`, background: isAlmostFull ? "#ef4444" : "#6D071A" }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              {tag}
            </span>
          ))}
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
}
