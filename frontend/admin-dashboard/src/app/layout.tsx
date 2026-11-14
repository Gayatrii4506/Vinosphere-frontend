import Sidebar from '@/components/layout/Sidebar'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VinoAdmin | Dashboard',
  description: 'Admin dashboard for Vinosphere',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
        <div className="relative z-10 flex w-full min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 bg-muted/20">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
