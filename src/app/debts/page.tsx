"use client"

import { useState, useEffect, Suspense } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  CheckCircle2, 
  Clock,
  Wallet,
  Loader2,
  Trash2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { AddDebtModal } from "@/components/debts/AddDebtModal"

function DebtContent() {
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "to_receive" | "to_pay">("all")
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    
    try {
      const { error } = await (supabase.from('debts') as any).delete().eq('id', id)
      if (error) throw error
      toast.success("Record deleted successfully")
      handleRefresh()
    } catch (error) {
      toast.error("Failed to delete record")
    }
  }

  const handleSettle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'settled' ? 'pending' : 'settled'
    try {
      const { error } = await (supabase.from('debts') as any).update({ status: newStatus }).eq('id', id)
      if (error) throw error
      toast.success(`Record marked as ${newStatus}`)
      handleRefresh()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const totals = {
    receivable: debts.filter(d => d.type === 'to_receive' && d.status === 'pending').reduce((acc, d) => acc + Number(d.amount), 0),
    payable: debts.filter(d => d.type === 'to_pay' && d.status === 'pending').reduce((acc, d) => acc + Number(d.amount), 0)
  }

  const filteredDebts = debts
    .filter(d => {
      const matchesSearch = d.person_name.toLowerCase().includes(search.toLowerCase()) ||
                          (d.note || "").toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || d.type === filter
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      // Pending first
      if (a.status === 'pending' && b.status === 'settled') return -1
      if (a.status === 'settled' && b.status === 'pending') return 1
      // Then by date descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="space-y-8 animate-in-fade pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <span className="w-8 h-px bg-primary/30" />
            Mera Khata
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Debts & Credits</h1>
          <p className="text-muted-foreground font-medium text-sm">Manage who owes you and who you owe.</p>
        </div>
        
        <AddDebtModal onDebtAdded={handleRefresh}>
          <Button className="rounded-[2rem] h-16 px-10 font-black text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:scale-105 transition-transform" />
            <div className="relative flex items-center gap-2">
              <Plus className="w-6 h-6" />
              New Record
            </div>
          </Button>
        </AddDebtModal>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="premium-card bg-emerald-500/[0.03] border-emerald-500/20 overflow-hidden group hover:border-emerald-500/40 transition-all duration-500">
          <CardContent className="pt-10 pb-8 px-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
               <ArrowUpRight className="w-32 h-32 text-emerald-600" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-emerald-600/60 text-[11px] font-black uppercase tracking-[0.2em]">Mera Lena (To Receive)</p>
              </div>
              <p className="text-5xl font-black text-emerald-600 tabular-nums tracking-tight">₹{totals.receivable.toLocaleString('en-IN')}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 w-fit px-4 py-2 rounded-2xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Active receivables
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card bg-rose-500/[0.03] border-rose-500/20 overflow-hidden group hover:border-rose-500/40 transition-all duration-500">
          <CardContent className="pt-10 pb-8 px-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700">
               <ArrowDownLeft className="w-32 h-32 text-rose-600" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-rose-600/60 text-[11px] font-black uppercase tracking-[0.2em]">Mera Karza (To Pay)</p>
              </div>
              <p className="text-5xl font-black text-rose-600 tabular-nums tracking-tight">₹{totals.payable.toLocaleString('en-IN')}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-500/10 w-fit px-4 py-2 rounded-2xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                 Outstanding debts
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-card/40 backdrop-blur-xl p-4 rounded-[2.5rem] border shadow-sm border-border/50">
         <div className="relative w-full xl:w-[28rem]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <input 
              type="text" 
              placeholder="Search person or note..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-2xl border-none bg-muted/50 text-base font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
            />
         </div>

         <div className="flex flex-wrap items-center justify-center gap-2 bg-muted/30 p-1.5 rounded-[1.5rem]">
            {[
              { label: "All Records", value: "all" },
              { label: "Lena (To Receive)", value: "to_receive" },
              { label: "Dena (To Pay)", value: "to_pay" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  filter === t.value 
                    ? "bg-background text-primary shadow-lg shadow-black/5 border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {t.label}
              </button>
            ))}
         </div>

         <div className="hidden xl:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-4">
            <Users className="w-4 h-4" />
            {filteredDebts.length} total entries
         </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Fetching Ledger...</p>
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6 bg-card/20 rounded-[4rem] border-2 border-dashed border-muted/50">
             <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 flex items-center justify-center">
                <Wallet className="w-12 h-12 text-muted-foreground/20" />
             </div>
             <div className="space-y-2">
                <p className="text-2xl font-black text-foreground">Clean Khata!</p>
                <p className="text-muted-foreground font-medium max-w-[250px] mx-auto text-sm">You don't have any active debts or credits at the moment.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDebts.map((debt) => (
              <div 
                key={debt.id}
                className={cn(
                  "relative p-8 rounded-[3rem] border bg-card/60 backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group overflow-hidden",
                  debt.status === 'settled' ? "opacity-60 grayscale-[0.5]" : "hover:-translate-y-2 hover:border-primary/20"
                )}
              >
                {/* Background Decor */}
                <div className={cn(
                  "absolute -right-12 -bottom-12 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-all group-hover:scale-150 group-hover:opacity-20",
                  debt.type === 'to_receive' ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="flex items-start justify-between mb-8 relative">
                   <div className={cn(
                     "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                     debt.type === 'to_receive' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                   )}>
                     {debt.type === 'to_receive' ? <ArrowUpRight className="w-8 h-8" /> : <ArrowDownLeft className="w-8 h-8" />}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-2xl shadow-sm border",
                        debt.status === 'settled' 
                          ? "bg-slate-100 text-slate-500 border-slate-200" 
                          : "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {debt.status}
                      </span>
                   </div>
                </div>

                <div className="space-y-2 relative mb-10">
                   <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{debt.person_name}</h3>
                   <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <FileText className="w-4 h-4 opacity-40" />
                      <p className="text-sm truncate">{debt.note || "Bina vivaran"}</p>
                   </div>
                </div>

                <div className="flex items-end justify-between relative">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-3">Total Amount</p>
                      <p className={cn(
                        "text-3xl font-black tabular-nums tracking-tight",
                        debt.type === 'to_receive' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        ₹{Number(debt.amount).toLocaleString('en-IN')}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Created On</p>
                      <p className="text-sm font-bold text-foreground/80">{format(new Date(debt.created_at), 'dd MMM, yyyy')}</p>
                   </div>
                </div>

                {/* Hover Actions */}
                <div className="mt-10 pt-6 border-t border-dashed border-muted flex items-center justify-between gap-3 relative">
                   <div className="flex items-center gap-2">
                      <AddDebtModal debt={debt} onDebtAdded={handleRefresh}>
                        <button className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                          <Plus className="w-5 h-5 rotate-45" /> {/* Using Plus rotated for edit or maybe just use an Edit icon */}
                        </button>
                      </AddDebtModal>
                      
                      <button 
                        onClick={() => handleDelete(debt.id)}
                        className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>

                   <button 
                    onClick={() => handleSettle(debt.id, debt.status)}
                    className={cn(
                      "flex-1 h-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                      debt.status === 'settled' 
                        ? "bg-slate-200 text-slate-500 hover:bg-slate-300" 
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                    )}
                   >
                     {debt.status === 'settled' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                     {debt.status === 'settled' ? 'Reopen' : 'Settle Now'}
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

export default function DebtsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <DebtContent />
      </Suspense>
    </AppLayout>
  )
}
