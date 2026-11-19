'use client'

import { FileCheck, Check, X, Eye, Building2, Mail, Phone, MapPin, Calendar, ShieldCheck, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateWineryStatus } from '@/lib/admin/adminActions'

export default function ApprovalsPage() {
  const [pendingWineries, setPendingWineries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedWinery, setSelectedWinery] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  async function fetchPending() {
    setLoading(true)
    try {
      // 1. Query Supabase for pending draft wineries
      const { data, error } = await supabase
        .from('wineries')
        .select('*')
        .eq('status', 'draft')
        .eq('verified', false)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setPendingWineries(data)
      } else {
        // 2. Query backend API fallback
        try {
          let res = await fetch('http://localhost:5000/api/v1/admin/pending')
          if (!res.ok) {
            res = await fetch('http://localhost:5000/api/v1/auth/admin/pending')
          }
          if (res.ok) {
            const body = await res.json()
            if (body.data) setPendingWineries(body.data)
          }
        } catch {
          // ignore offline
        }
      }
    } catch (err: any) {
      console.error('Error fetching pending wineries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  async function handleApprove(winery: any) {
    if (!confirm(`Approve "${winery.name}"?\n\nThis will activate their estate profile and allow them to log in with their registered credentials. ${winery.email || 'their registered email'}.`)) {
      return
    }

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

  async function handleReject(winery: any) {
    if (!confirm(`Are you sure you want to reject the application for "${winery.name}"?`)) {
      return
    }

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Estate Onboarding Approvals</h1>
          <p className="text-slate-500 text-sm">
            Verify new winery registration documents and profiles. Once approved, the estate profile is activated and login credentials are automatically emailed to the winery owner.
          </p>
        </div>

        <button 
          onClick={fetchPending}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-600' : 'text-purple-600'} />
          <span>Refresh Applications</span>
        </button>
      </div>

      {/* Confirmation Toast */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' ? (
              <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <X size={20} className="text-red-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{toastMessage.text}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Scanning database for pending estate submissions...</p>
          </div>
        )}

        {!loading && pendingWineries.map((winery) => (
          <div 
            key={winery.id} 
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100 shadow-inner">
                <Building2 size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight">{winery.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Pending Verification
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> {winery.city || 'Nashik Valley'}, {winery.state || 'Maharashtra'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> {winery.email || 'Email provided in details'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" /> Registered: {new Date(winery.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {winery.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 pt-1.5 italic max-w-2xl">
                    &ldquo;{winery.description}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button 
                onClick={() => setSelectedWinery(winery)} 
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs border border-slate-200"
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
                Approve
              </button>

              <button 
                onClick={() => handleReject(winery)} 
                disabled={actionLoading === winery.id}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition text-xs disabled:opacity-50"
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ))}

        {!loading && pendingWineries.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-1">All Caught Up!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              There are no pending winery onboarding applications. When a new estate registers on the Winery Dashboard, their application will appear here for superadmin review.
            </p>
          </div>
        )}
      </div>

      {/* Full Verification Modal */}
      {selectedWinery && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Estate Application Details</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-0.5">{selectedWinery.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedWinery(null)} 
                className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Registered Email</span>
                  <span className="font-semibold text-slate-900 break-all">{selectedWinery.email || 'Not specified'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</span>
                  <span className="font-semibold text-slate-900">{selectedWinery.phone || 'Not specified'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location / Terroir</span>
                  <span className="font-semibold text-slate-900">{selectedWinery.city || 'Nashik Valley'}, {selectedWinery.state || 'Maharashtra'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Application Date</span>
                  <span className="font-semibold text-slate-900">{new Date(selectedWinery.created_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              {selectedWinery.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Estate Story & Winemaking Philosophy</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 leading-relaxed text-slate-700 text-xs">
                    {selectedWinery.description}
                  </div>
                </div>
              )}

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-emerald-900">Approval Actions</p>
                <p className="text-emerald-700">
                  Approving this estate will activate and publish their profile, allowing them to immediately log in to the Winery Dashboard with their registered email and password.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedWinery(null)} 
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <button 
                onClick={() => handleReject(selectedWinery)} 
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs border border-red-200"
              >
                Reject Application
              </button>
              <button 
                onClick={() => handleApprove(selectedWinery)} 
                disabled={actionLoading === selectedWinery.id}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-2"
              >
                <Check size={16} /> Approve Estate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
