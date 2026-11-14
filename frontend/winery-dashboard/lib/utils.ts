import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "₹") {
  return `${currency}${(price || 0).toLocaleString("en-IN")}`;
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStars(rating: number): { filled: number; empty: number } {
  const filled = Math.floor(rating);
  const empty = 5 - filled;
  return { filled, empty };
}

export function generateQRData(ticketId: string, eventName: string) {
  return `VINOSPHERE:${ticketId}:${eventName}:${Date.now()}`;
}
