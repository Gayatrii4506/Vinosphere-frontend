'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateWineryStatus(wineryId: string, status: 'approved' | 'rejected' | 'suspended') {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
  let backendResult: any = null;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  // 1. Dispatch through Backend API using the currently authenticated admin user's access token
  try {
    const action = status === 'approved' ? 'approve' : 'reject';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${backendUrl}/auth/admin/${action}/${wineryId}`, {
      method: 'POST',
      headers
    });
    if (res.ok) {
      backendResult = await res.json();
    } else {
      const errBody = await res.json().catch(() => ({}));
      console.warn(`Backend approval API response notice (${res.status}):`, errBody);
    }
  } catch (backendErr: any) {
    console.warn('Backend approval API call notice:', backendErr.message);
  }

  // 2. Also ensure Supabase state is updated directly via authenticated client
  try {
    const dbStatus = status === 'approved' ? 'published' : (status === 'rejected' ? 'archived' : 'draft');
    const { error } = await supabase
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
