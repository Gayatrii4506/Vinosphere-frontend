'use client'

import { FileCheck, Check, X, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateWineryStatus } from '@/lib/actions/adminActions'

export default function ApprovalsPage() {
  const [pendingWineries, setPendingWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPending() {
      const { data } = await supabase
        .from('wineries')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      
      if (data) setPendingWineries(data)
      setLoading(false)
    }

    fetchPending()

    const channel = supabase.channel('pending_approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wineries', filter: "status=eq.pending" }, () => fetchPending())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleApprove = async (id: string) => {
    await updateWineryStatus(id, 'approved')
    setPendingWineries(prev => prev.filter(w => w.id !== id))
  }

  const handleReject = async (id: string) => {
    await updateWineryStatus(id, 'rejected')
    setPendingWineries(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Document Approvals</h1>
        <p className="text-muted-foreground">Review and approve winery registration documents.</p>
      </div>

      <div className="grid gap-6">
        {loading && <div className="text-center py-10 text-muted-foreground">Loading pending approvals...</div>}
        
        {!loading && pendingWineries.map((winery) => (
          <div key={winery.id} className="bg-card rounded-2xl border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-colors shadow-sm">
            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-foreground">{winery.name}</h3>
                  <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                    {winery.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">Location: <span className="font-semibold text-foreground">{winery.city || 'Unknown'}</span></p>
                <p className="text-muted-foreground/70 text-xs mt-2 font-medium">Registered on: {new Date(winery.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl transition-colors text-sm">
                View Details
              </button>
              <button onClick={() => handleApprove(winery.id)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm">
                <Check size={16} /> Approve
              </button>
              <button onClick={() => handleReject(winery.id)} className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-destructive text-destructive hover:bg-destructive/10 font-semibold rounded-xl transition-colors text-sm">
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        ))}
        
        {!loading && pendingWineries.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <FileCheck size={32} />
            </div>
            <p className="text-foreground font-semibold text-lg mb-1">All Caught Up!</p>
            <p className="text-muted-foreground">No pending approvals at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
