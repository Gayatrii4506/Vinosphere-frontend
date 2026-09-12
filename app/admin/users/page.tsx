import { Users as UsersIcon, Store, ShieldCheck, User } from 'lucide-react'
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
    return <div className="p-8 text-red-600">Error fetching users: {error.message}</div>
  }

  const allUsers = users || []
  const consumerCount = allUsers.filter(u => !u.role || u.role === 'user').length
  const wineryAdminCount = allUsers.filter(u => u.role === 'winery_admin' || u.role === 'winery' || !!u.winery_id).length
  const superadminCount = allUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">User & Role Management</h1>
          <p className="text-slate-500 text-sm">View, inspect, and manage separate roles for consumers, winery administrators, and superadmins.</p>
        </div>
      </div>

      {/* Role Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <User size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{consumerCount}</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consumers (Users)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Store size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{wineryAdminCount}</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Winery Admins</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{superadminCount}</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Superadmins</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
              )}
              {allUsers.map((user) => {
                const isWineryAdmin = user.role === 'winery_admin' || user.role === 'winery' || !!user.winery_id;
                const isSuperadmin = user.role === 'admin' || user.role === 'superadmin';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                          isSuperadmin 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : isWineryAdmin 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{user.full_name || 'Anonymous User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSuperadmin ? (
                        <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-200">
                          <ShieldCheck size={13} /> Superadmin
                        </span>
                      ) : isWineryAdmin ? (
                        <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg border bg-purple-50 text-purple-700 border-purple-200">
                          <Store size={13} /> Winery Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
                          <User size={13} /> Consumer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
