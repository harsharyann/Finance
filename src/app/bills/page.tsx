"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { CalendarDays, Bell, Clock, Plus, CheckCircle2, Trash2, MoreVertical, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AddBillModal } from "@/components/bills/AddBillModal"
import { createClient } from "@/utils/supabase/client"
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBills()
  }, [])

  async function fetchBills() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await (supabase.from('bills') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (error) throw error
      setBills(data || [])
    } catch (error: any) {
      console.error("Fetch Error:", error)
      toast.error(error.message || "Failed to fetch bills")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bill?")) return
    try {
      const { error } = await (supabase.from('bills') as any).delete().eq('id', id)
      if (error) throw error
      toast.success("Bill deleted")
      setBills(bills.filter(b => b.id !== id))
    } catch (error: any) {
      toast.error("Failed to delete bill")
    }
  }

  async function handleMarkAsPaid(bill: any) {
    try {
      // 1. Update bill status
      const { error: billError } = await (supabase.from('bills') as any)
        .update({ status: 'paid' })
        .eq('id', bill.id)

      if (billError) throw billError

      // 2. Automatically add to transactions
      const { error: txError } = await (supabase.from('transactions') as any)
        .insert({
          user_id: bill.user_id,
          amount: bill.amount,
          type: 'expense',
          category: bill.category,
          note: `Paid Bill: ${bill.name}`,
          date: format(new Date(), 'yyyy-MM-dd')
        })

      if (txError) throw txError

      toast.success("Bill marked as paid and added to transactions!")
      fetchBills()
    } catch (error: any) {
      toast.error("Failed to update bill")
    }
  }

  const stats = {
    totalPending: bills.filter(b => b.status !== 'paid').reduce((acc, b) => acc + Number(b.amount), 0),
    dueSoon: bills.filter(b => b.status !== 'paid' && isBefore(parseISO(b.due_date), addDays(new Date(), 7))).length,
    paidThisMonth: bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + Number(b.amount), 0)
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-in-fade">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-black text-foreground">Bills & Reminders</h1>
            <p className="text-muted-foreground mt-1">Manage your recurring payments and dues.</p>
          </div>
          <AddBillModal>
            <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Add New Reminder
            </Button>
          </AddBillModal>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="premium-card bg-card border-border overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-black text-foreground">₹{stats.totalPending.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-card border-border overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Soon (7 days)</p>
                  <p className="text-2xl font-black text-foreground">{stats.dueSoon} Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-card border-border overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Total</p>
                  <p className="text-2xl font-black text-foreground">₹{stats.paidThisMonth.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Active Reminders</h2>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
              {bills.length} Total
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                <Bell className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No bills found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Click the button above to add your first bill reminder.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {bills.map((bill) => {
                const isOverdue = isBefore(parseISO(bill.due_date), new Date()) && bill.status !== 'paid'
                return (
                  <div 
                    key={bill.id} 
                    className={`group flex items-center justify-between p-5 bg-card border rounded-2xl transition-all hover:shadow-md ${
                      bill.status === 'paid' ? 'opacity-60 grayscale-[0.5]' : 'hover:border-primary/50'
                    } ${isOverdue ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                      }`}>
                        {bill.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{bill.name}</h3>
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {bill.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {format(parseISO(bill.due_date), 'dd MMM, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-black text-foreground">₹{Number(bill.amount).toLocaleString('en-IN')}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                          bill.status === 'paid' ? 'text-emerald-500' : isOverdue ? 'text-rose-500' : 'text-primary'
                        }`}>
                          {bill.status}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {bill.status !== 'paid' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-bold h-9 border-primary/20 text-primary hover:bg-primary/10"
                            onClick={() => handleMarkAsPaid(bill)}
                          >
                            Mark Paid
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem 
                              className="text-rose-500 focus:text-rose-500 focus:bg-rose-50 cursor-pointer"
                              onClick={() => handleDelete(bill.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
