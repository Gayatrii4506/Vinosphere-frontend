'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAdminClient() {
  const cookieStore = await cookies()
  
  // 1. First get a normal client to verify the caller
  const normalClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )

  const { data: { user }, error } = await normalClient.auth.getUser()
  if (error || !user) {
    throw new Error("Unauthorized: No valid session found.")
  }

  // 2. Strict Role Verification
  // We verify strictly against the secure Supabase Auth app_metadata
  // which cannot be modified by the user.
  const isAdmin = user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    throw new Error("Unauthorized: Explicit Admin privileges required.")
  }
  
  // 3. If verified, return the service role client
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )
}

export async function updateWineryStatus(wineryId: string, status: 'approved' | 'rejected' | 'suspended') {
  const supabaseAdmin = await getAdminClient()
  
  const { error } = await supabaseAdmin
    .from('wineries')
    .update({ status })
    .eq('id', wineryId)

  if (error) {
    console.error(`Failed to update winery ${wineryId} to ${status}:`, error)
    throw new Error(error.message)
  }

  return { success: true }
}
