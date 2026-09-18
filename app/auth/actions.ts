'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
  
  // Check if onboarding is complete
  if (authData.user?.user_metadata?.onboarding_complete !== true) {
    return redirect('/onboarding')
  }

  revalidatePath('/', 'layout')
  const targetUrl = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/'
  redirect(targetUrl)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
        data: {
            onboarding_complete: false
        }
    }
  })

  if (error) {
    return redirect(`/welcome?error=${error.message}`)
  }

  // After signup, they might be logged in immediately (if email confirmations are disabled)
  // We'll redirect to onboarding or let them verify email.
  const { data: authData } = await supabase.auth.getSession()
  if (authData.session) {
      redirect('/onboarding')
  } else {
      // If email confirmation is required
      redirect(`/welcome?message=Check your email to verify your account`)
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
    // Find the host so we know where to redirect back to
    const host = headerList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${protocol}://${host}/auth/callback`,
      },
    })
  
    if (error) {
        return redirect(`/welcome?error=${error.message}`)
    }

    if (data.url) {
        redirect(data.url) // Redirect to the Google OAuth page
    }
}
