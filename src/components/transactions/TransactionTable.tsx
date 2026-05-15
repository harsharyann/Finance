"use client"

import { useEffect, useState, useMemo } from "react"
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

export function TransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  
  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch {
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const { error } = await (supabase.from("transactions") as any).delete().eq("id", deleteId)
      if (error) throw error
      toast.success("Transaction deleted")
      setTransactions((prev) => prev.filter((t) => t.id !== deleteId))
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

  // Summary stats
  const totalIncome = filtered.filter(t => t.type === "income").reduce((a, c) => a + Number(c.amount), 0)
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, c) => a + Number(c.amount), 0)

  return (
    <div className="space-y-5">

      {/* === SEARCH + FILTER BAR === */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by note, category or method..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted rounded-xl p-1">
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 capitalize",
                filterType === type
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* === MINI SUMMARY ROW === */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border border-l-4 border-l-emerald-500">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Income</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              +₹{totalIncome.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border border-l-4 border-l-rose-500">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Expenses</p>
            <p className="text-base font-black text-rose-600 dark:text-rose-400 tabular-nums">
              -₹{totalExpense.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* === TABLE / LIST === */}
      {loading ? (
        <div className="flex justify-center items-center h-52 bg-card border border-border rounded-2xl">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 bg-card border border-border rounded-2xl gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {search ? "Try a different search term" : "Add your first transaction!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_100px_110px_44px] gap-0 px-4 py-3 bg-muted/50 border-b border-border">
            {["Transaction", "Category", "Date", "Method", "Amount", ""].map((h, i) => (
              <p key={i} className={cn(
                "text-[11px] font-black uppercase tracking-wider text-muted-foreground",
                i === 4 ? "text-right" : ""
              )}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.map((t, idx) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_110px_44px] sm:grid-cols-[1fr_120px_100px_100px_110px_44px] gap-0 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors duration-100 animate-in-fade"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Transaction name + icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    t.type === "income"
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                  )}>
                    {t.type === "income"
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownLeft className="w-4 h-4" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-none">
                      {t.note || t.category}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
                      <span className="sm:hidden">{format(new Date(t.date), "dd MMM")}</span>
                      <span className="sm:hidden">•</span>
                      <span>{t.category}</span>
                    </p>
                  </div>
                </div>

                {/* Category chip (Hidden on mobile) */}
                <div className="hidden sm:block">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold",
                    getCategoryColor(t.category)
                  )}>
                    {t.category}
                  </span>
                </div>

                {/* Date (Hidden on mobile) */}
                <p className="hidden sm:block text-sm text-muted-foreground font-medium">
                  {format(new Date(t.date), "dd MMM")}
                </p>

                {/* Method (Hidden on mobile) */}
                <p className="hidden sm:block text-sm text-muted-foreground font-medium truncate">
                  {t.payment_method || "—"}
                </p>

                {/* Amount */}
                <p className={cn(
                  "text-sm font-black text-right tabular-nums",
                  t.type === "income"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}>
                  {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                </p>

                {/* Delete */}
                <div className="flex justify-center ml-2">
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="text-foreground font-bold">{filtered.length}</span> of <span className="text-foreground font-bold">{transactions.length}</span> transactions
            </p>
          </div>
        </div>
      )}

      {/* === DELETE CONFIRMATION DIALOG === */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the transaction record from your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2 pt-2">
            <Button
              variant="destructive"
              className="rounded-xl font-bold flex-1 sm:flex-none"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl font-bold flex-1 sm:flex-none"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
