import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user has completed onboarding
      const isOnboardingComplete = data.user.user_metadata?.onboarding_complete === true
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        if (!isOnboardingComplete) {
            return NextResponse.redirect(`${origin}/onboarding`)
        }
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        if (!isOnboardingComplete) {
            return NextResponse.redirect(`https://${forwardedHost}/onboarding`)
        }
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        if (!isOnboardingComplete) {
            return NextResponse.redirect(`${origin}/onboarding`)
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/welcome?error=AuthFailed`)
}
