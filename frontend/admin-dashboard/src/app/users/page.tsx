import { Users as UsersIcon, UserCheck } from 'lucide-react'
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

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-[#EF4444]">
        <p className="font-serif font-bold text-lg">Error accessing user registry</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-[#ECECEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Patron Membership
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-[#222222] mt-0.5">
            Registered Users & Connoisseurs
          </h1>
          <p className="text-[#888888] text-xs mt-1">
            Global directory of consumers, verified winery representatives, and administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-[#FDF2F4] text-[#6D071A] font-bold text-xs rounded-xl border border-[#6D071A]/20 flex items-center gap-2">
            <UserCheck size={14} className="text-[#D4AF37]" />
            <span>{users?.length || 0} Accounts Enrolled</span>
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#ECECEC]">
            <thead className="bg-[#FAF7F2]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Member Profile
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Email Address
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Platform Role
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Date Enrolled
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                  Governance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]/60 text-sm">
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    <UsersIcon size={32} className="mx-auto mb-2 text-[#888888] opacity-60" />
                    <p className="font-serif font-bold text-[#222222]">No member accounts discovered</p>
                    <p className="text-xs mt-1">Platform registrations will appear in this registry.</p>
                  </td>
                </tr>
              )}

              {users?.map((user) => {
                const initial = (user.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                return (
                  <tr key={user.id} className="hover:bg-[#F8F9FB] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#6D071A] text-white flex items-center justify-center font-serif font-bold text-sm border border-[#D4AF37]/40 shadow-xs shrink-0">
                          {initial}
                        </div>
                        <div>
                          <span className="font-semibold text-[#222222] text-sm block group-hover:text-[#6D071A] transition-colors">
                            {user.full_name || 'Connoisseur'}
                          </span>
                          <span className="text-[10px] text-[#888888] font-mono">
                            ID: {user.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-mono">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-[#FAF5D3] text-[#936F18] border-[#D4AF37]/30">
                        {user.role || 'Member'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[#888888] text-xs font-mono">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <button className="text-[#EF4444] hover:text-[#DC2626] font-semibold px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer">
                        Restrict
                      </button>
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
