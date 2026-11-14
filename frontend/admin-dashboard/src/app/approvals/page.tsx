'use client'

import { FileCheck, Check, X, FileText, Eye, Building2, Mail, Phone, MapPin, Calendar, Compass, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateWineryStatus } from '@/lib/actions/adminActions'

export default function ApprovalsPage() {
  const [pendingWineries, setPendingWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedWinery, setSelectedWinery] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  async function fetchPending() {
    try {
      // 1. Fetch from Supabase
      const { data, error } = await supabase
        .from('wineries')
        .select('*')
        .or('status.eq.DRAFT,status.eq.pending,status.eq.draft')
        .eq('verified', false)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setPendingWineries(data)
      } else {
        // 2. Also query backend API if Supabase table is empty
        try {
          const res = await fetch('http://localhost:5000/api/v1/auth/admin/pending')
          if (res.ok) {
            const body = await res.json()
            if (body.data) setPendingWineries(body.data)
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error fetching pending wineries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()

    const channel = supabase
      .channel('pending_approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wineries' }, () => {
        fetchPending()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleApprove = async (winery: any) => {
    const confirmApprove = window.confirm(`Approve "${winery.name}"?\n\nThis will activate their estate profile and email their login link and credentials to ${winery.email || 'their registered email'}.`)
    if (!confirmApprove) return

    setActionLoading(winery.id)
    try {
      const res = await updateWineryStatus(winery.id, 'approved')
      setPendingWineries(prev => prev.filter(w => w.id !== winery.id))
      if (selectedWinery?.id === winery.id) setSelectedWinery(null)
      
      setToastMessage({
        type: 'success',
        text: res.message || `Estate "${winery.name}" has been approved! Login credentials dispatched to ${winery.email || 'the owner'}.`
      })
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to approve winery.'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (winery: any) => {
    const confirmReject = window.confirm(`Are you sure you want to reject the application for "${winery.name}"?`)
    if (!confirmReject) return

    setActionLoading(winery.id)
    try {
      await updateWineryStatus(winery.id, 'rejected')
      setPendingWineries(prev => prev.filter(w => w.id !== winery.id))
      if (selectedWinery?.id === winery.id) setSelectedWinery(null)

      setToastMessage({
        type: 'success',
        text: `Winery "${winery.name}" application has been rejected.`
      })
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to reject winery.'
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Estate Onboarding Approvals</h1>
          <p className="text-muted-foreground text-sm">
            Verify new winery registration documents and profiles. Once approved, the estate profile is activated and login credentials are automatically emailed to the winery owner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-300 dark:border-amber-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {pendingWineries.length} Pending Review
          </span>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200' 
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-900 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-lg">{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold opacity-60 hover:opacity-100 p-1">✕</button>
        </div>
      )}

      {/* Cards List */}
      <div className="grid gap-6">
        {loading && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-muted-foreground text-sm font-medium">Loading pending winery applications...</p>
          </div>
        )}

        {!loading && pendingWineries.map((winery) => (
          <div 
            key={winery.id} 
            className="bg-card rounded-2xl border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition shadow-sm"
          >
            <div className="flex gap-5 items-start flex-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 shrink-0">
                <Building2 size={28} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">{winery.name}</h3>
                  <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    Awaiting Superadmin Approval
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" /> {winery.city || 'Nashik Valley'}, {winery.state || 'Maharashtra'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" /> {winery.email || 'Email provided in details'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" /> Registered: {new Date(winery.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {winery.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1.5 italic">
                    &ldquo;{winery.description}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button 
                onClick={() => setSelectedWinery(winery)} 
                className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl transition text-xs border border-border"
              >
                <Eye size={15} /> View Details
              </button>

              <button 
                onClick={() => handleApprove(winery)} 
                disabled={actionLoading === winery.id}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-xs shadow-sm disabled:opacity-50"
              >
                {actionLoading === winery.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check size={15} />
                )}
                Approve & Email
              </button>

              <button 
                onClick={() => handleReject(winery)} 
                disabled={actionLoading === winery.id}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold rounded-xl transition text-xs disabled:opacity-50"
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ))}

        {!loading && pendingWineries.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-1">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              There are no pending winery onboarding applications. When a new estate registers on the Winery Dashboard, their application will appear here for superadmin review.
            </p>
          </div>
        )}
      </div>

      {/* Full Verification Modal */}
      {selectedWinery && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-primary/5 p-6 border-b border-border flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Estate Application Details</span>
                <h2 className="text-2xl font-bold text-foreground mt-0.5">{selectedWinery.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedWinery(null)} 
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Registered Email</span>
                  <span className="font-semibold text-foreground break-all">{selectedWinery.email || 'Not specified'}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Phone Number</span>
                  <span className="font-semibold text-foreground">{selectedWinery.phone || 'Not specified'}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Location / Terroir</span>
                  <span className="font-semibold text-foreground">{selectedWinery.city || 'Nashik Valley'}, {selectedWinery.state || 'Maharashtra'}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Application Date</span>
                  <span className="font-semibold text-foreground">{new Date(selectedWinery.created_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              {selectedWinery.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estate Story & Winemaking Philosophy</h4>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border leading-relaxed text-foreground text-xs">
                    {selectedWinery.description}
                  </div>
                </div>
              )}

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">Approval Actions</p>
                <p className="text-emerald-800/80 dark:text-emerald-300/80">
                  Approving this estate will automatically publish their profile, activate their credentials, and dispatch the official welcome email containing their login URL and password.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-muted/20 border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setSelectedWinery(null)} 
                className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <button 
                onClick={() => handleReject(selectedWinery)} 
                className="px-5 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-xl text-xs border border-destructive/30"
              >
                Reject Application
              </button>
              <button 
                onClick={() => handleApprove(selectedWinery)} 
                disabled={actionLoading === selectedWinery.id}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-2"
              >
                <Check size={16} /> Approve & Dispatch Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
