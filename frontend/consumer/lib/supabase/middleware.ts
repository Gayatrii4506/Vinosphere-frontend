import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // 1. Guard /profile for authenticated users
    if (!user && pathname.startsWith('/profile')) {
      const url = request.nextUrl.clone()
      url.pathname = '/welcome'
      url.searchParams.set('redirect', pathname)
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    // 2. Guard /admin routes — require authenticated user with verified admin role
    if (pathname.startsWith('/admin')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/welcome'
        url.searchParams.set('redirect', pathname)
        url.searchParams.set('error', 'Administrator login required')
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
      }

      // Check trusted admin role from immutable app_metadata
      const appRole = (user.app_metadata?.role || user.app_metadata?.user_role || '').toLowerCase()
      let isAdmin = appRole === 'admin' || appRole === 'superadmin'

      // Fallback: check database public.users table if app_metadata not populated
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
          // Fallback to appRole
        }
      }

      if (!isAdmin) {
        // Authenticated non-admin: redirect away from admin zone
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('error', 'Unauthorized: Admin privileges required')
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
      }
    }
  } catch (err) {
    console.error('Middleware session update warning:', err)
  }

  return supabaseResponse
}
