import Link from 'next/link'
import { LayoutDashboard, Wine, FileCheck, Users, LogOut, Calendar, Compass, Ticket, Star } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col min-h-screen relative shadow-lg">
      <div className="p-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-3">
          <Wine size={24} />
        </div>
        <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Platform Control</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <LayoutDashboard size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Overview</span>
        </Link>
        <Link href="/users" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Users size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Users</span>
        </Link>
        <Link href="/wineries" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <StoreIcon />
          <span className="font-medium">Wineries</span>
        </Link>
        <Link href="/approvals" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <FileCheck size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Approvals</span>
        </Link>
        <Link href="/wines" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Wine size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Wines</span>
        </Link>
        <Link href="/events" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Calendar size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Events</span>
        </Link>
        <Link href="/experiences" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Compass size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Experiences</span>
        </Link>
        <Link href="/bookings" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Ticket size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Bookings</span>
        </Link>
        <Link href="/reviews" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-300 group">
          <Star size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Reviews</span>
        </Link>
      </nav>
      
      <div className="p-6 border-t border-border mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full rounded-xl transition-all duration-300 group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

function StoreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:scale-110 transition-transform duration-300">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  )
}
