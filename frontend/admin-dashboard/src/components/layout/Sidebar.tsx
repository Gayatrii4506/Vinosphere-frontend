'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Wine, 
  FileCheck, 
  Users, 
  LogOut, 
  Calendar, 
  Compass, 
  Ticket, 
  Star, 
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error(e)
    }
    localStorage.removeItem('token')
    router.refresh()
  }

  const navSections = [
    {
      label: 'Core Intelligence',
      items: [
        { href: '/', label: 'Overview', icon: LayoutDashboard },
        { href: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
      ]
    },
    {
      label: 'Estate Management',
      items: [
        { href: '/wineries', label: 'Wineries', icon: StoreIcon },
        { href: '/approvals', label: 'Onboarding Approvals', icon: FileCheck },
        { href: '/wines', label: 'Wine Catalog', icon: Wine },
      ]
    },
    {
      label: 'Experiences & Guests',
      items: [
        { href: '/events', label: 'Events', icon: Calendar },
        { href: '/experiences', label: 'Tasting & Tours', icon: Compass },
        { href: '/bookings', label: 'Reservations', icon: Ticket },
        { href: '/users', label: 'User Directory', icon: Users },
        { href: '/reviews', label: 'Member Reviews', icon: Star },
      ]
    }
  ]

  return (
    <aside className="w-[260px] bg-white border-r border-[#ECECEC] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      <div className="overflow-hidden flex flex-col flex-1">
        {/* Logo Brand Header — Official Logo */}
        <div className="p-5 border-b border-[#ECECEC] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/vinosphere-logo.png" 
              alt="VinoSphere" 
              className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF5D3] text-[#936F18] border border-[#D4AF37]/30 rounded uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Navigation Links — Styled directly like Winery Management */}
        <nav className="p-4 space-y-5 overflow-y-auto flex-1">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#888888] font-mono mb-1">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-[#FDF2F4] text-[#6D071A]"
                          : "text-[#5D5D5D] hover:bg-[#F8F9FB] hover:text-[#222222]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive 
                              ? "text-[#6D071A]" 
                              : "text-[#888888] group-hover:text-[#5D5D5D]"
                          }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span>{item.label}</span>
                      </div>

                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6D071A]" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#ECECEC] space-y-2 bg-white">
        <div className="flex items-center gap-3 p-2 bg-[#F8F9FB] rounded-xl border border-[#ECECEC]/60">
          <div className="w-9 h-9 rounded-lg bg-[#6D071A] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
            VA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#222222] truncate">Super Administrator</p>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[10px] text-[#888888] font-semibold uppercase">Platform Verified</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#EF4444] bg-[#F8F9FB] rounded-xl hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Console</span>
        </button>
      </div>
    </aside>
  )
}

function StoreIcon(props: { className?: string, strokeWidth?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={16} 
      height={16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={props.strokeWidth || 2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  )
}
