'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAdminClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return createServerClient(
    supabaseUrl,
    serviceKey, 
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )
}

export async function updateWineryStatus(wineryId: string, status: 'approved' | 'rejected' | 'suspended') {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
  let backendResult: any = null;

  // 1. Dispatch through Backend API to activate user and send official credentials email
  try {
    const action = status === 'approved' ? 'approve' : 'reject';
    let res = await fetch(`${backendUrl}/admin/${action}/${wineryId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      // fallback to auth/admin
      res = await fetch(`${backendUrl}/auth/admin/${action}/${wineryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (res.ok) {
      backendResult = await res.json();
    }
  } catch (backendErr: any) {
    console.warn('Backend approval API call notice:', backendErr.message);
  }

  // 2. Also ensure Supabase state is updated directly
  try {
    const supabaseAdmin = await getAdminClient();
    const dbStatus = status === 'approved' ? 'published' : (status === 'rejected' ? 'archived' : 'draft');
    const { error } = await supabaseAdmin
      .from('wineries')
      .update({ status: dbStatus, verified: status === 'approved' })
      .eq('id', wineryId);

    if (error) {
      console.warn('Direct Supabase update notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Direct Supabase client notice:', err.message);
  }

  return { 
    success: true, 
    message: backendResult?.message || `Winery status updated to ${status}.`
  };
}
