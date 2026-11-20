'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/supabase/config'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const redirectParam = (formData.get('redirect') as string) || ''

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorUrl = redirectParam 
      ? `/welcome?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectParam)}`
      : `/welcome?error=${encodeURIComponent(error.message)}`
    return redirect(errorUrl)
  }
  
  // Check if onboarding is complete or if user already has profile details stored
  if (authData.user?.user_metadata?.onboarding_complete !== true) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('experience_level, full_name, role')
      .or(`auth_id.eq.${authData.user.id},email.eq.${authData.user.email}`)
      .maybeSingle()

    if (dbUser && (dbUser.experience_level || dbUser.full_name || dbUser.role === 'winery_admin')) {
      // Mark metadata as completed so it never asks again
      await supabase.auth.updateUser({
        data: { onboarding_complete: true }
      }).catch(() => {})
    } else {
      return redirect('/onboarding')
    }
  }

  revalidatePath('/', 'layout')
  const targetUrl = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/'
  redirect(targetUrl)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headerList = await headers()
  const siteUrl = getSiteUrl(headerList)

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
        data: {
            onboarding_complete: false
        }
    }
  })

  if (error) {
    return redirect(`/welcome?error=${encodeURIComponent(error.message)}`)
  }

  // After signup, they might be logged in immediately (if email confirmations are disabled)
  // We'll redirect to onboarding or let them verify email.
  const { data: authData } = await supabase.auth.getSession()
  if (authData.session) {
      redirect('/onboarding')
  } else {
      // If email confirmation is required
      redirect(`/welcome?message=${encodeURIComponent('Check your email to verify your account')}`)
  }
}

export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const headerList = await headers()
    const siteUrl = getSiteUrl(headerList)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })
  
    if (error) {
        return redirect(`/welcome?error=${encodeURIComponent(error.message)}`)
    }

    if (data.url) {
        redirect(data.url) // Redirect to the Google OAuth page
    }
}
