import { Users as UsersIcon } from 'lucide-react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )

  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  
  if (error) {
    return <div className="p-8 text-destructive">Error fetching users: {error.message}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered accounts on the platform.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              )}
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        <UsersIcon size={18} />
                      </div>
                      <span className="font-semibold text-foreground text-base">{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20">
                      User
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-destructive hover:text-destructive/80 font-semibold px-4 py-2 hover:bg-destructive/10 rounded-lg transition-colors">
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
