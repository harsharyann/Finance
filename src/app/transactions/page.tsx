"use client"

import { useEffect, useState, Suspense } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { Plus, Wallet, TrendingDown, TrendingUp, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

function TransactionsContent() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewedUser, setViewedUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const userIdParam = searchParams.get("user_id")

  useEffect(() => {
    fetchInitialData()
  }, [userIdParam])

  async function fetchInitialData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if current user is admin
      const { data: profile } = (await (supabase.from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single()) as any
      
      const isUserAdmin = profile?.role === 'admin'
      setIsAdmin(isUserAdmin)

      // Target user ID
      const targetId = (isUserAdmin && userIdParam) ? userIdParam : user.id

      // If viewing another user, fetch their profile info
      if (isUserAdmin && userIdParam && userIdParam !== user.id) {
        const { data: targetProfile } = (await (supabase.from('profiles') as any)
          .select('name, email')
          .eq('id', userIdParam)
          .single()) as any
        setViewedUser(targetProfile)
      } else {
        setViewedUser(null)
      }

      // Fetch Transactions
      const { data, error } = await (supabase.from('transactions') as any)
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const totals = {
    income: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
  }

  return (
    <div className="space-y-8 animate-in-fade">
      
      {/* ADMIN OVERLAY */}
      {viewedUser && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between mb-4 animate-in-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary/70 leading-none">Admin Mode</p>
              <h4 className="font-black text-foreground mt-1">Viewing data for: <span className="text-primary">{viewedUser.name || viewedUser.email}</span></h4>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-primary/20 hover:bg-primary hover:text-white"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <span className="w-8 h-px bg-primary/30" />
            Ledger
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Transactions</h1>
          <p className="text-muted-foreground font-medium">Detailed history of your financial movements.</p>
        </div>
        
        {!userIdParam && (
          <AddTransactionModal onTransactionAdded={fetchInitialData}>
            <Button className="rounded-2xl h-14 px-8 font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </Button>
          </AddTransactionModal>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="premium-card bg-card border-border overflow-hidden">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">Total Volume</p>
                <p className="text-3xl font-black mt-1 tabular-nums">₹{(totals.income + totals.expense).toLocaleString('en-IN')}</p>
              </div>
              <Wallet className="w-10 h-10 text-muted-foreground/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-500/60 text-xs font-black uppercase tracking-widest">Inflow</p>
                <p className="text-3xl font-black mt-1 tabular-nums text-emerald-600">₹{totals.income.toLocaleString('en-IN')}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-500/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card bg-rose-500/5 border-rose-500/20">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-500/60 text-xs font-black uppercase tracking-widest">Outflow</p>
                <p className="text-3xl font-black mt-1 tabular-nums text-rose-600">₹{totals.expense.toLocaleString('en-IN')}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-rose-500/10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-[2rem] overflow-hidden shadow-sm">
        <TransactionTable 
          transactions={transactions} 
          loading={loading} 
          onDelete={fetchInitialData}
          isAdminView={!!userIdParam}
        />
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionsContent />
      </Suspense>
    </AppLayout>
  )
}
