import Sidebar from '@/components/admin/Sidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VinoAdmin | Dashboard',
  description: 'Admin dashboard for Vinosphere',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex w-screen h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
