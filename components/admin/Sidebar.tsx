'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wine, FileCheck, Users, LogOut, Calendar, Compass, Ticket, Star, FlaskConical } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/wineries', label: 'Wineries', icon: StoreIcon },
    { href: '/admin/approvals', label: 'Approvals', icon: FileCheck },
    { href: '/admin/wines', label: 'Wines', icon: Wine },
    { href: '/admin/wine-quality', label: 'AI Quality Lab', icon: FlaskConical },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/experiences', label: 'Experiences', icon: Compass },
    { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen relative shadow-sm shrink-0">
      <div className="p-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-3">
          <Wine size={24} />
        </div>
        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Platform Control</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        {links.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'text-slate-900 bg-slate-100 font-semibold shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-purple-600' : 'text-slate-500 group-hover:scale-110 transition-transform duration-200'} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="p-6 border-t border-slate-200 mt-auto">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 w-full rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-200 text-slate-500" />
          <span className="font-medium text-sm">Exit to Store</span>
        </Link>
      </div>
    </div>
  )
}

function StoreIcon({ size = 20, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  )
}
