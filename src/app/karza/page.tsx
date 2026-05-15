"use client"

import { useState, useEffect, Suspense } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  Wallet,
  Loader2,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { AddDebtModal } from "@/components/karza/AddDebtModal"

function KarzaContent() {
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchDebts()
  }, [refreshKey])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  async function fetchDebts() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await (supabase.from('debts') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDebts(data || [])
    } catch (error) {
      toast.error("Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  const totals = {
    receivable: debts.filter(d => d.type === 'to_receive' && d.status === 'pending').reduce((acc, d) => acc + Number(d.amount), 0),
    payable: debts.filter(d => d.type === 'to_pay' && d.status === 'pending').reduce((acc, d) => acc + Number(d.amount), 0)
  }

  const filteredDebts = debts.filter(d => 
    d.person_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.note || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in-fade">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <span className="w-8 h-px bg-primary/30" />
            Mera Khata
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Karza / Udhaar</h1>
          <p className="text-muted-foreground font-medium">Manage who owes you and who you owe.</p>
        </div>
        
        <AddDebtModal onDebtAdded={handleRefresh}>
          <Button className="rounded-2xl h-14 px-8 font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Naya Udhaar
          </Button>
        </AddDebtModal>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="premium-card bg-emerald-500/5 border-emerald-500/20 overflow-hidden group">
          <CardContent className="pt-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
               <ArrowUpRight className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-emerald-600/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Mera Lena (To Receive)</p>
              <p className="text-4xl font-black text-emerald-600 tabular-nums">₹{totals.receivable.toLocaleString('en-IN')}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600/70 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 Total active receivables
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card bg-rose-500/5 border-rose-500/20 overflow-hidden group">
          <CardContent className="pt-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
               <ArrowDownLeft className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-rose-600/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Mera Karza (To Pay)</p>
              <p className="text-4xl font-black text-rose-600 tabular-nums">₹{totals.payable.toLocaleString('en-IN')}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600/70 bg-rose-500/10 w-fit px-3 py-1.5 rounded-full">
                 <Clock className="w-3.5 h-3.5" />
                 Total outstanding debts
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by person name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
         </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Fetching Ledger...</p>
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
             <Wallet className="w-16 h-16 text-muted-foreground/20" />
             <div className="space-y-1">
                <p className="text-xl font-black text-foreground">Clean Khata!</p>
                <p className="text-sm text-muted-foreground font-medium">No active debts or credits found.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDebts.map((debt) => (
              <div 
                key={debt.id}
                className={cn(
                  "relative p-6 rounded-[2.5rem] border bg-card/50 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-black/5 group",
                  debt.status === 'settled' ? "opacity-60 grayscale" : ""
                )}
              >
                <div className="flex items-start justify-between mb-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     debt.type === 'to_receive' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                   )}>
                     {debt.type === 'to_receive' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                   </div>
                   <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        debt.status === 'settled' ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      )}>
                        {debt.status}
                      </span>
                   </div>
                </div>

                <div className="space-y-1">
                   <h3 className="text-xl font-black text-foreground tracking-tight">{debt.person_name}</h3>
                   <p className="text-xs font-bold text-muted-foreground truncate">{debt.note || "No notes added"}</p>
                </div>

                <div className="mt-6 flex items-end justify-between">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1.5">Amount</p>
                      <p className={cn(
                        "text-2xl font-black tabular-nums",
                        debt.type === 'to_receive' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        ₹{Number(debt.amount).toLocaleString('en-IN')}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5">Date</p>
                      <p className="text-xs font-bold text-foreground">{format(new Date(debt.created_at), 'dd MMM yyyy')}</p>
                   </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="w-9 h-9 rounded-xl bg-card border flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KarzaPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <KarzaContent />
      </Suspense>
    </AppLayout>
  )
}
