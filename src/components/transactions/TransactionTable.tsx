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

const categoryColors: Record<string, string> = {
  "Shop Stock":    "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  "Food":          "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  "Transport":     "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  "Electricity":   "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
  "Salary":        "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
  "Rent":          "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300",
  "Personal":      "bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300",
  "Miscellaneous": "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  "Other":         "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
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
    <div className="space-y-5 p-4 sm:p-6">

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl p-1">
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all capitalize",
                filterType === type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* MINI SUMMARY ROW */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">Inflow</p>
            <p className="text-sm font-black text-emerald-600 tabular-nums mt-1">₹{totalIncome.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <TrendingDown className="w-4 h-4 text-rose-600" />
          <div>
            <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest leading-none">Outflow</p>
            <p className="text-sm font-black text-rose-600 tabular-nums mt-1">₹{totalExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* TABLE / LIST */}
      {loading ? (
        <div className="flex justify-center items-center h-52">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-center gap-2">
          <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm font-bold text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between p-3.5 hover:bg-muted/30 rounded-2xl transition-all border border-transparent hover:border-border"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  t.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}>
                  {t.type === "income" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">{t.note || t.category}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.category}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black tabular-nums",
                    t.type === "income" ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{t.payment_method}</p>
                </div>
                <button
                  onClick={() => setDeleteId(t.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Delete Transaction?</DialogTitle>
            <DialogDescription className="font-medium">
              This will permanently remove this record. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="rounded-xl font-black"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
