import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Check if user needs onboarding
      const isOnboardingComplete = data.user?.user_metadata?.onboarding_complete === true
      
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = isOnboardingComplete ? next : '/onboarding'
      redirectUrl.searchParams.delete('token_hash')
      redirectUrl.searchParams.delete('type')
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return the user to an error page with some instructions
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/welcome'
  errorUrl.searchParams.set('message', 'Invalid or expired confirmation link.')
  return NextResponse.redirect(errorUrl)
}
