'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(urlError || '')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      const user = data.user
      // Verify admin role
      const appRole = (user?.app_metadata?.role || '').toLowerCase()
      let isAdmin = appRole === 'admin' || appRole === 'superadmin'

      if (!isAdmin) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .or(`auth_id.eq.${user?.id},email.eq.${user?.email}`)
          .maybeSingle()

        const dbRole = (dbUser?.role || '').toLowerCase()
        if (dbRole === 'admin' || dbRole === 'superadmin') {
          isAdmin = true
        }
      }

      if (!isAdmin) {
        await supabase.auth.signOut()
        setErrorMsg('Access denied: Administrator privileges required.')
        setLoading(false)
        return
      }

      router.push(redirectPath.startsWith('/') ? redirectPath : '/')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during authentication.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#FDF2F4] border border-[#6D071A]/10 mb-4">
          <img
            src="/vinosphere-logo.png"
            alt="VinoSphere Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#222222]">
          VinoSphere Executive Console
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
          Administrative Access Portal
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-snug">{errorMsg}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vinosphere.in"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D071A] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D071A] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#6D071A] hover:bg-[#520513] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Admin Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Executive Console</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
        <span>Protected by Supabase Enterprise Cryptographic Auth</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-400 text-sm">Loading admin authentication...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  )
}
