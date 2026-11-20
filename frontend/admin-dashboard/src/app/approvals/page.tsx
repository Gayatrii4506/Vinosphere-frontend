'use client'

import { 
  FileCheck, Check, X, Eye, Building2, 
  Mail, MapPin, Calendar, ShieldCheck
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { updateWineryStatus } from '@/lib/actions/adminActions'

export default function ApprovalsPage() {
  const [pendingWineries, setPendingWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedWinery, setSelectedWinery] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock background scrolling and attach Escape key listener when modal is open
  useEffect(() => {
    if (selectedWinery) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      const mainEl = document.querySelector('main')
      const originalMainOverflow = mainEl ? mainEl.style.overflow : ''

      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      if (mainEl) {
        mainEl.style.overflow = 'hidden'
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedWinery(null)
        }
      }
      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
        if (mainEl) {
          mainEl.style.overflow = originalMainOverflow
        }
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectedWinery])

  async function fetchPending() {
    try {
      const { data, error } = await supabase
        .from('wineries')
        .select('*')
        .eq('status', 'draft')
        .eq('verified', false)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setPendingWineries(data)
      } else {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1'
          const sessionRes = await supabase.auth.getSession()
          const token = sessionRes.data?.session?.access_token
          const headers: Record<string, string> = {}
          if (token) headers['Authorization'] = `Bearer ${token}`
          const res = await fetch(`${backendUrl}/auth/admin/pending`, { headers })
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
    const confirmApprove = window.confirm(
      `Approve "${winery.name}"?\n\nThis will verify their estate profile, activate their dashboard access, and email their login link and credentials to ${winery.email || 'their registered email'}.`
    )
    if (!confirmApprove) return

    setActionLoading(winery.id)
    try {
      const res = await updateWineryStatus(winery.id, 'approved')
      setPendingWineries(prev => prev.filter(w => w.id !== winery.id))
      if (selectedWinery?.id === winery.id) setSelectedWinery(null)
      
      setToastMessage({
        type: 'success',
        text: res.message || `Estate "${winery.name}" verified! Welcome credentials dispatched to ${winery.email || 'the owner'}.`
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
    const confirmReject = window.confirm(`Are you sure you want to decline the onboarding application for "${winery.name}"?`)
    if (!confirmReject) return

    setActionLoading(winery.id)
    try {
      await updateWineryStatus(winery.id, 'rejected')
      setPendingWineries(prev => prev.filter(w => w.id !== winery.id))
      if (selectedWinery?.id === winery.id) setSelectedWinery(null)

      setToastMessage({
        type: 'success',
        text: `Application for "${winery.name}" has been declined.`
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
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Estate Governance
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Winery Partner Onboarding
          </h1>
          <p className="text-[#888888] text-xs max-w-2xl mt-1">
            Review estate terroir, certifications, and representative documents. Verification activates the partner's public profile and dispatches encrypted login credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FAF5D3] text-[#936F18] font-bold text-xs rounded-xl border border-[#D4AF37]/30 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            {pendingWineries.length} Pending Review
          </span>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-[#FAF5D3] border-[#D4AF37]/40 text-[#222222]' 
            : 'bg-[#FDF2F4] border-[#6D071A]/30 text-[#6D071A]'
        }`}>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-base">{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-xs font-bold opacity-70 hover:opacity-100 p-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#ECECEC] shadow-xs">
            <div className="inline-block w-8 h-8 border-3 border-[#6D071A] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[#888888] text-xs font-medium">Retrieving estate partner submissions...</p>
          </div>
        )}

        {!loading && pendingWineries.map((winery) => (
          <div 
            key={winery.id} 
            className="bg-white rounded-2xl border border-[#ECECEC] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-[#6D071A]/30 transition-all duration-200 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#6D071A]" />

            <div className="flex gap-5 items-start flex-1">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF2F4] flex items-center justify-center text-[#6D071A] border border-[#6D071A]/20 shrink-0">
                <Building2 size={26} />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold font-serif text-[#222222]">{winery.name}</h3>
                  <span className="px-2.5 py-0.5 bg-[#FAF5D3] border border-[#D4AF37]/30 text-[#936F18] text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Awaiting Superadmin Review
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-6 text-xs text-[#888888] pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#6D071A] shrink-0" /> 
                    <span className="truncate">{winery.city || 'Nashik Valley'}, {winery.state || 'Maharashtra'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[#936F18] shrink-0" /> 
                    <span className="truncate">{winery.email || 'Email in details'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#888888] shrink-0" /> 
                    <span>Submitted: {new Date(winery.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                </div>

                {winery.description && (
                  <p className="text-xs text-[#6D6D6D] line-clamp-2 pt-1 font-serif italic">
                    &ldquo;{winery.description}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Action Directives */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              <button 
                onClick={() => setSelectedWinery(winery)} 
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8F9FB] hover:bg-[#ECECEC] text-[#222222] font-semibold rounded-xl transition text-xs border border-[#ECECEC] cursor-pointer"
              >
                <Eye size={14} /> Review Dossier
              </button>

              <button 
                onClick={() => handleApprove(winery)} 
                disabled={actionLoading === winery.id}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#6D071A] hover:bg-[#841126] text-white font-bold rounded-xl transition text-xs shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === winery.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Authorize & Email Credentials
              </button>

              <button 
                onClick={() => handleReject(winery)} 
                disabled={actionLoading === winery.id}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-[#EF4444]/30 text-[#EF4444] hover:bg-red-50 font-bold rounded-xl transition text-xs disabled:opacity-50 cursor-pointer"
              >
                <X size={14} /> Decline
              </button>
            </div>
          </div>
        ))}

        {!loading && pendingWineries.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#ECECEC] shadow-sm">
            <div className="w-16 h-16 bg-[#FAF5D3] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#D4AF37] border border-[#D4AF37]/30">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-[#222222] font-bold font-serif text-xl mb-1">Estate Queue Up to Date</h3>
            <p className="text-[#888888] text-xs max-w-md mx-auto leading-relaxed">
              No pending partner winery applications await review. When an estate submits verification via the partner portal, their dossier will appear here for superadmin review.
            </p>
          </div>
        )}
      </div>

      {/* Estate Application Modal / Dossier — Portal Mounted & Viewport Fixed */}
      {mounted && selectedWinery && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedWinery(null)
          }}
        >
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl border border-[#ECECEC] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-winery-title"
          >
            {/* Modal Header — Fixed / Pinned */}
            <div className="bg-[#6D071A] p-5 sm:p-6 text-white flex justify-between items-start shrink-0 border-b border-[#841126]">
              <div className="pr-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF5D3] font-mono">
                  Estate Dossier & Verification
                </span>
                <h2 id="modal-winery-title" className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5 line-clamp-1">
                  {selectedWinery.name}
                </h2>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedWinery(null)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer shrink-0"
                aria-label="Close dossier modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body — Internal Scroll Only */}
            <div className="p-5 sm:p-7 space-y-5 overflow-y-auto overscroll-contain flex-1 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 bg-[#F8F9FB] rounded-xl border border-[#ECECEC]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Contact Email
                  </span>
                  <span className="font-semibold text-[#222222] break-all text-xs sm:text-sm">
                    {selectedWinery.email || 'Not provided'}
                  </span>
                </div>
                <div className="p-4 bg-[#F8F9FB] rounded-xl border border-[#ECECEC]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Phone / Representative
                  </span>
                  <span className="font-semibold text-[#222222] text-xs sm:text-sm">
                    {selectedWinery.phone || 'Not provided'}
                  </span>
                </div>
                <div className="p-4 bg-[#F8F9FB] rounded-xl border border-[#ECECEC]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Location / Terroir
                  </span>
                  <span className="font-semibold text-[#222222] text-xs sm:text-sm">
                    {selectedWinery.city || 'Nashik Valley'}, {selectedWinery.state || 'Maharashtra'}
                  </span>
                </div>
                <div className="p-4 bg-[#F8F9FB] rounded-xl border border-[#ECECEC]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Date of Submission
                  </span>
                  <span className="font-semibold text-[#222222] text-xs sm:text-sm">
                    {new Date(selectedWinery.created_at || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedWinery.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] font-mono">
                    Estate Story & Winemaking Philosophy
                  </h4>
                  <div className="p-4 bg-[#F8F9FB] rounded-2xl border border-[#ECECEC] leading-relaxed text-[#222222] text-xs font-serif">
                    {selectedWinery.description}
                  </div>
                </div>
              )}

              <div className="p-4 bg-[#FDF2F4] border border-[#6D071A]/20 rounded-2xl text-xs space-y-1 text-[#222222]">
                <p className="font-bold text-[#6D071A] flex items-center gap-1.5">
                  <ShieldCheck size={15} /> Automated Authorization Routine
                </p>
                <p className="text-[#6D6D6D] leading-relaxed">
                  Approving activates their winery listing on the consumer platform and dispatches a verified email containing their login URL and password.
                </p>
              </div>
            </div>

            {/* Modal Footer — Fixed Action Buttons */}
            <div className="p-4 sm:p-5 bg-[#F8F9FB] border-t border-[#ECECEC] flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedWinery(null)} 
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#ECECEC] text-[#222222] hover:bg-[#ECECEC] font-semibold rounded-xl text-xs cursor-pointer transition text-center"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={() => handleReject(selectedWinery)} 
                disabled={actionLoading === selectedWinery.id}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-50 text-[#EF4444] hover:bg-red-100 font-semibold rounded-xl text-xs border border-[#EF4444]/30 cursor-pointer transition text-center disabled:opacity-50"
              >
                Decline Application
              </button>
              <button 
                type="button"
                onClick={() => handleApprove(selectedWinery)} 
                disabled={actionLoading === selectedWinery.id}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#6D071A] hover:bg-[#841126] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {actionLoading === selectedWinery.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Authorize & Dispatch Credentials
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
