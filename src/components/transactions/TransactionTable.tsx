"use client"

import { useEffect, useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft, Edit2, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id) // SECURITY
        .order('date', { ascending: false })
      
      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const { error } = await (supabase.from('transactions') as any)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success("Transaction deleted")
      setTransactions(transactions.filter(t => t.id !== id))
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to delete transaction")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border">
        <p className="text-muted-foreground">No transactions found. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold">Transaction</TableHead>
            <TableHead className="font-bold">Category</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Method</TableHead>
            <TableHead className="font-bold text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <span className="font-bold">{t.note || t.category}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-lg bg-secondary text-xs font-medium">{t.category}</span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(t.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {t.payment_method || 'N/A'}
              </TableCell>
              <TableCell className={cn(
                "text-right font-bold",
                t.type === 'income' ? "text-emerald-600" : "text-foreground"
              )}>
                {t.type === 'income' ? "+" : "-"}₹{t.amount.toLocaleString('en-IN')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="gap-2">
                      <Edit2 className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteTransaction(t.id)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
