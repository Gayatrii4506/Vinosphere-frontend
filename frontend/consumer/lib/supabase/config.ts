export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erhrrlykjaubbjkgzuac.supabase.co';

export const SUPABASE_ANON_KEY =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaHJybHlramF1YmJqa2d6dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzI4NzksImV4cCI6MjEwMTI0ODg3OX0.jkuNzdJttH6GLKvxLS9Yo1lN--iltvrJSSrZxIpwvzc').trim();

/**
 * Resolves the canonical base URL for authentication redirects (OAuth, email confirm, etc.).
 * Supports both local development (http://localhost:3000) and Vercel production.
 *
 * Order of resolution:
 * 1. If an incoming request is explicitly from localhost / 127.0.0.1, preserve the local development flow.
 * 2. Canonical production URL from NEXT_PUBLIC_SITE_URL (e.g., https://vinosphere-frontend.vercel.app).
 * 3. Request headers from reverse proxy / load balancer (x-forwarded-host / host + x-forwarded-proto).
 * 4. Vercel deployment URL (NEXT_PUBLIC_VERCEL_URL or VERCEL_URL).
 * 5. Default fallback to http://localhost:3000.
 */
export function getSiteUrl(headersList?: Headers): string {
  // If the request explicitly comes from localhost / 127.0.0.1, preserve local dev flow
  if (headersList) {
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      const proto = headersList.get('x-forwarded-proto') || 'http';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 1. Canonical NEXT_PUBLIC_SITE_URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    const formatted = envUrl.startsWith('http://') || envUrl.startsWith('https://')
      ? envUrl
      : `https://${envUrl}`;
    return formatted.replace(/\/+$/, '');
  }

  // 2. Request headers from proxy / edge
  if (headersList) {
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    if (host) {
      const proto = headersList.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 3. Vercel system environment variable
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl) {
    const trimmed = vercelUrl.trim();
    const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    return formatted.replace(/\/+$/, '');
  }

  // 4. Fallback for local development
  return 'http://localhost:3000';
}

