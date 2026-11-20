import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthOrLoginPage = pathname.startsWith('/login') || pathname.startsWith('/auth')

  // Helper to ensure refreshed session cookies are carried over to redirect responses
  const createRedirectResponse = (targetPath: string, searchParams?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = targetPath
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, val]) => url.searchParams.set(key, val))
    }
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 1. Unauthenticated users must be redirected to the login page
  if (!user) {
    if (!isAuthOrLoginPage) {
      return createRedirectResponse('/login', { redirect: pathname })
    }
    return supabaseResponse
  }

  // 2. Authenticated users: verify admin role using TRUSTED server-side sources.
  // CRITICAL: We NEVER trust user.user_metadata because users can edit it themselves.
  let isAdmin = false

  // Source A: Immutable app_metadata set by Supabase Auth / server-side admin claims
  const appRole = (user.app_metadata?.role || user.app_metadata?.user_role || '').toLowerCase()
  if (appRole === 'admin' || appRole === 'superadmin') {
    isAdmin = true
  }

  // Source B: Database public.users table lookup if role claim is not yet in app_metadata
  if (!isAdmin) {
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle()

      const dbRole = (dbUser?.role || '').toLowerCase()
      if (dbRole === 'admin' || dbRole === 'superadmin') {
        isAdmin = true
      }
    } catch {
      // In offline/test environments, keep appRole determination
    }
  }

  // 3. Block authenticated non-admin users from accessing executive console
  if (!isAdmin) {
    if (!isAuthOrLoginPage) {
      return createRedirectResponse('/login', {
        error: 'Unauthorized: Administrator privileges are required to access this portal.',
      })
    }
    return supabaseResponse
  }

  // 4. Authenticated admin visiting login page -> redirect to overview dashboard
  if (isAdmin && isAuthOrLoginPage) {
    return createRedirectResponse('/')
  }

  return supabaseResponse
}
