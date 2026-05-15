"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { 
  Users, 
  Search, 
  Lock, 
  Unlock, 
  Trash2, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, totalTxns: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/dashboard')
      return
    }

    const { data: profile } = (await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()) as any

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    fetchAdminData()
  }

  async function fetchAdminData() {
    setLoading(true)
    try {
      // Fetch Users
      const { data: userData, error: userError } = (await (supabase.from('profiles') as any).select('*')) as any
      if (userError) throw userError

      // Fetch Global Stats (using a trick or separate queries)
      const { count: txCount } = (await (supabase.from('transactions') as any).select('*', { count: 'exact', head: true })) as any

      setUsers(userData || [])
      setStats({
        totalUsers: userData?.length || 0,
        totalTxns: txCount || 0
      })
    } catch (error: any) {
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  async function toggleLock(userId: string, currentStatus: boolean) {
    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({ is_locked: !currentStatus })
        .eq('id', userId)
      
      if (error) throw error
      toast.success(`User ${currentStatus ? 'unlocked' : 'locked'} successfully`)
      fetchAdminData()
    } catch (error: any) {
      toast.error("Failed to update user status")
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure? This will delete the user profile and all their data.")) return
    try {
      // Deleting from profiles triggers cascade if configured, 
      // but note that deleting from auth.users requires service role.
      // For now, we delete from public.profiles
      const { error } = await (supabase.from('profiles') as any).delete().eq('id', userId)
      if (error) throw error
      toast.success("User removed from database")
      fetchAdminData()
    } catch (error: any) {
      toast.error("Failed to delete user")
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAdmin) return null

  return (
    <AppLayout>
      <div className="space-y-8 animate-in-fade max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" />
            System Master Control
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground font-medium">Monitoring and managing all active users on the platform.</p>
        </div>

        {/* OVERVIEW STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="premium-card bg-primary text-white border-none shadow-2xl shadow-primary/20">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-black uppercase tracking-widest">Total Active Users</p>
                  <p className="text-4xl font-black mt-1 tabular-nums">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-white/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-card border-border overflow-hidden">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">Global Transactions</p>
                  <p className="text-4xl font-black mt-1 tabular-nums">{stats.totalTxns}</p>
                </div>
                <ArrowRight className="w-12 h-12 text-muted-foreground/10" />
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-rose-500/5 border-rose-500/20">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-500/60 text-xs font-black uppercase tracking-widest">Alerts / Logs</p>
                  <p className="text-4xl font-black mt-1 tabular-nums">0</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-rose-500/10" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* USER MANAGEMENT */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-foreground">User Management</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 rounded-xl h-11 bg-muted/50 border-none focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Joined</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                              {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground leading-none">{user.name || "Unnamed"}</p>
                              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                          {format(new Date(user.created_at), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                            user.role === 'admin' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${user.is_locked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                            <span className="text-xs font-bold capitalize">{user.is_locked ? 'Locked' : 'Active'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-9 w-9 text-primary hover:bg-primary/10"
                              title="View Activity"
                              onClick={() => router.push(`/transactions?user_id=${user.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`rounded-xl h-9 w-9 ${user.is_locked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                              title={user.is_locked ? "Unlock User" : "Lock User"}
                              onClick={() => toggleLock(user.id, user.is_locked)}
                            >
                              {user.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </Button>
                            {user.role !== 'admin' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl h-9 w-9 text-rose-500 hover:bg-rose-50"
                                title="Remove User"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
