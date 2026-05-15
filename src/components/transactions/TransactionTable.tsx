"use client"

import { useState, useMemo } from "react"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MoreVertical,
  CalendarDays
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const categoryColors: Record<string, string> = {
  "Shop Stock":    "bg-blue-500/10 text-blue-600",
  "Food":          "bg-orange-500/10 text-orange-600",
  "Transport":     "bg-purple-500/10 text-purple-600",
  "Electricity":   "bg-yellow-500/10 text-yellow-600",
  "Salary":        "bg-emerald-500/10 text-emerald-600",
  "Rent":          "bg-rose-500/10 text-rose-600",
  "Personal":      "bg-pink-500/10 text-pink-600",
  "Miscellaneous": "bg-gray-500/10 text-gray-600",
  "Other":         "bg-slate-500/10 text-slate-600",
}

function getCategoryColor(cat: string) {
  return categoryColors[cat] || "bg-primary/10 text-primary"
}

interface TransactionTableProps {
  transactions: any[]
  loading: boolean
  onDelete?: () => void
  isAdminView?: boolean
}

export function TransactionTable({ 
  transactions, 
  loading, 
  onDelete,
  isAdminView = false 
}: TransactionTableProps) {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  async function handleConfirmDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const { error } = await (supabase.from("transactions") as any).delete().eq("id", deleteId)
      if (error) throw error
      toast.success("Transaction deleted")
      onDelete?.()
      router.refresh()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        (t.note || "").toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.payment_method || "").toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === "all" || t.type === filterType
      return matchesSearch && matchesType
    })
  }, [transactions, search, filterType])

  const totalIncome = filtered.filter(t => t.type === "income").reduce((a, c) => a + Number(c.amount), 0)
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, c) => a + Number(c.amount), 0)

  return (
    <div className="space-y-6 p-3 sm:p-8">

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by anything..."
            className="w-full h-12 pl-11 pr-4 rounded-[1.25rem] border-none bg-muted/50 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 rounded-[1.25rem] p-1.5 overflow-x-auto no-scrollbar">
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filterType === type
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* MINI SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] leading-none">Total Income</p>
            <p className="text-2xl font-black text-emerald-600 tabular-nums mt-1.5">₹{totalIncome.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-rose-500/5 border border-rose-500/10">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
             <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] leading-none">Total Expense</p>
            <p className="text-2xl font-black text-rose-600 tabular-nums mt-1.5">₹{totalExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Fetching Records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/60">
            <AlertCircle className="w-12 h-12 text-muted-foreground/20" />
            <div className="space-y-1">
              <p className="text-lg font-black text-foreground">No records found</p>
              <p className="text-sm text-muted-foreground font-medium">Try adjusting your filters or search.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">All Activity</span>
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[10px] font-black text-muted-foreground/40">{filtered.length} total</span>
             </div>

             <div className="space-y-2.5">
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="group relative bg-card border hover:border-primary/30 rounded-[2rem] p-1.5 pr-4 transition-all hover:shadow-2xl hover:shadow-primary/5 flex items-center gap-4"
                  >
                    {/* Icon Container */}
                    <div className={cn(
                      "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {t.type === "income" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 py-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-black text-foreground truncate tracking-tight">{t.note || t.category}</p>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                               getCategoryColor(t.category)
                             )}>
                               {t.category}
                             </span>
                             <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/70">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {format(new Date(t.date), "dd MMM, yyyy")}
                             </div>
                          </div>
                        </div>

                        {/* Amount - Responsive size */}
                        <div className="text-right shrink-0">
                           <p className={cn(
                             "text-lg sm:text-xl font-black tabular-nums leading-none",
                             t.type === "income" ? "text-emerald-600" : "text-rose-600"
                           )}>
                             {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                           </p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1.5">{t.payment_method}</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-1 ml-2">
                       <button
                         onClick={() => setDeleteId(t.id)}
                         className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 className="w-4.5 h-4.5" />
                       </button>
                    </div>

                    {/* Mobile Actions (Dropdown) */}
                    <div className="sm:hidden">
                       <DropdownMenu>
                         <DropdownMenuTrigger
                           render={
                             <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/40">
                               <MoreVertical className="w-5 h-5" />
                             </button>
                           }
                         />
                         <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[140px]">
                           <DropdownMenuItem 
                             className="text-rose-500 focus:text-rose-500 focus:bg-rose-50 rounded-xl font-bold p-3"
                             onClick={() => setDeleteId(t.id)}
                           >
                             <Trash2 className="w-4 h-4 mr-2" />
                             Delete
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[400px]">
          <DialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500">
               <Trash2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Delete record?</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                This transaction will be permanently removed. This cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1 rounded-2xl h-12 font-bold">
              Keep it
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="flex-1 rounded-2xl h-12 font-black shadow-lg shadow-rose-500/20"
            >
              {isDeleting ? "Deleting..." : "Delete Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
