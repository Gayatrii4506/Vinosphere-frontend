import Sidebar from '@/components/layout/Sidebar'
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'VinoSphere | Admin Console',
  description: 'Enterprise administration, analytics, and estate operations for the VinoSphere platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#F8F9FB] text-[#222222] font-sans antialiased selection:bg-[#6D071A] selection:text-white">
        <div className="relative z-10 flex w-full min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* TOP NAVIGATION BAR — Matches Winery Dashboard with Brand Logo */}
            <header className="h-[72px] bg-white border-b border-[#ECECEC] px-8 flex justify-between items-center shrink-0 sticky top-0 z-20 shadow-xs">
              {/* Top Left: Logo Brand Identity Header on Every Page */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 group">
                  <img
                    src="/vinosphere-logo.png"
                    alt="VinoSphere Logo"
                    className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="hidden sm:block border-l border-[#ECECEC] pl-3">
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block font-mono">
                      Admin Platform
                    </span>
                    <span className="text-xs font-semibold text-[#6D071A]">
                      Executive Console
                    </span>
                  </div>
                </Link>
              </div>

              {/* Top Right: Status Badges & Profile */}
              <div className="flex items-center gap-5">
                <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D071A] animate-pulse" />
                  Ecosystem Live · v2.4 SaaS
                </span>

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#222222]">Super Administrator</p>
                  <p className="text-[10px] text-[#888888] font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#6D071A] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs border border-[#D4AF37]/50">
                  VA
                </div>
              </div>
            </header>

            {/* Scrollable Main Workspace */}
            <main className="flex-1 overflow-y-auto p-8 sm:p-10 bg-[#F8F9FB]">
              <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
