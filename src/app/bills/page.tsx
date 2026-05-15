"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { 
  CalendarDays, 
  Bell, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  MoreVertical, 
  AlertCircle,
  IndianRupee,
  Zap,
  Wifi,
  Home as HomeIcon,
  ShoppingBag,
  CreditCard as CardIcon,
  Wallet as WalletIcon
} from "lucide-react"
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
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<string, any> = {
  Rent: HomeIcon,
  Electricity: Zap,
  Water: Zap,
  Internet: Wifi,
  Mobile: Wifi,
  Subscription: ShoppingBag,
  Insurance: Bell,
  "Credit Card": CardIcon,
  EMI: WalletIcon,
  Other: CalendarDays
}

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
      const { error: billError } = await (supabase.from('bills') as any)
        .update({ status: 'paid' })
        .eq('id', bill.id)

      if (billError) throw billError

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
    paidTotal: bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + Number(b.amount), 0)
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-in-fade max-w-5xl mx-auto">
        
        {/* === MODERN HEADER === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold tracking-tight text-sm uppercase">
              <span className="w-8 h-px bg-primary/30" />
              Manage Dues
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Bills & Reminders</h1>
            <p className="text-muted-foreground text-sm font-medium">Track and settle your recurring payments seamlessly.</p>
          </div>
          <AddBillModal>
            <Button className="rounded-2xl h-14 px-8 font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Add New Bill
            </Button>
          </AddBillModal>
        </div>

        {/* === PREMIUM STATS GRID === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { 
              label: "Total Pending", 
              value: `₹${stats.totalPending.toLocaleString('en-IN')}`, 
              icon: AlertCircle, 
              color: "primary", 
              bg: "bg-primary/5",
              border: "border-primary/20"
            },
            { 
              label: "Due in 7 Days", 
              value: `${stats.dueSoon} Bills`, 
              icon: Clock, 
              color: "amber-500", 
              bg: "bg-amber-500/5",
              border: "border-amber-500/20"
            },
            { 
              label: "Total Paid", 
              value: `₹${stats.paidTotal.toLocaleString('en-IN')}`, 
              icon: CheckCircle2, 
              color: "emerald-500", 
              bg: "bg-emerald-500/5",
              border: "border-emerald-500/20"
            }
          ].map((stat, i) => (
            <div 
              key={i} 
              className={cn(
                "relative p-6 rounded-[2rem] border overflow-hidden transition-all hover:scale-[1.02]",
                stat.bg, stat.border
              )}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-background shadow-sm border", stat.border)}>
                  <stat.icon className={cn("w-6 h-6", `text-${stat.color}`)} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/70">{stat.label}</p>
                  <p className="text-3xl font-black text-foreground mt-1 tabular-nums">{stat.value}</p>
                </div>
              </div>
              {/* Decorative Background Element */}
              <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20", `bg-${stat.color}`)} />
            </div>
          ))}
        </div>

        {/* === BILLS LIST === */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-xl font-black text-foreground">Active Subscriptions & Bills</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing with your ledger...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/60 mx-1">
              <div className="w-20 h-20 rounded-[2rem] bg-background flex items-center justify-center shadow-xl border border-border/50 rotate-3 animate-in-zoom">
                <Bell className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">No active reminders</h3>
                <p className="text-muted-foreground max-w-[280px] mx-auto text-sm font-medium">
                  Add your rent, electricity or subscription bills to never miss a due date again.
                </p>
              </div>
              <AddBillModal>
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-primary hover:text-white transition-all">
                  Create First Reminder
                </Button>
              </AddBillModal>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bills.map((bill) => {
                const isOverdue = isBefore(parseISO(bill.due_date), new Date()) && bill.status !== 'paid'
                const Icon = CATEGORY_ICONS[bill.category] || CATEGORY_ICONS.Other
                
                return (
                  <div 
                    key={bill.id} 
                    className={cn(
                      "group relative flex items-center justify-between p-1.5 pl-5 bg-card border rounded-[2rem] transition-all duration-300",
                      bill.status === 'paid' ? 'opacity-60 border-border/40' : 'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5',
                      isOverdue ? 'border-rose-500/30 bg-rose-500/[0.02]' : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-5 py-2.5">
                      {/* Icon with Dynamic Color */}
                      <div className={cn(
                        "w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                        bill.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-lg text-foreground tracking-tight">{bill.name}</h3>
                          {isOverdue && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase bg-rose-500/10 px-2.5 py-1 rounded-full animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5" /> Overdue
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {bill.category}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <span className={cn(
                            "text-xs font-bold flex items-center gap-1.5",
                            isOverdue ? "text-rose-500" : "text-muted-foreground"
                          )}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            {format(parseISO(bill.due_date), 'dd MMMM, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pr-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-2xl font-black text-foreground tabular-nums">₹{Number(bill.amount).toLocaleString('en-IN')}</p>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] mt-0.5",
                          bill.status === 'paid' ? 'text-emerald-500' : isOverdue ? 'text-rose-500' : 'text-primary'
                        )}>
                          {bill.status}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {bill.status !== 'paid' && (
                          <Button 
                            className="rounded-2xl font-black h-12 px-6 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-none border-none"
                            onClick={() => handleMarkAsPaid(bill)}
                          >
                            Pay Now
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-muted transition-colors">
                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[140px] border-none shadow-2xl">
                            <DropdownMenuItem 
                              className="text-rose-500 focus:text-rose-500 focus:bg-rose-50 cursor-pointer rounded-xl font-bold p-3"
                              onClick={() => handleDelete(bill.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Bill
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

        {/* === FEATURE HIGHLIGHT === */}
        <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 flex-shrink-0">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black text-foreground">Coming Soon: Automatic Bill Fetch</h4>
            <p className="text-sm text-muted-foreground font-medium max-w-lg">
              We're working on a feature that will automatically fetch your bills from SMS and email, 
              so you don't have to enter them manually. Stay tuned!
            </p>
          </div>
          <div className="md:ml-auto">
             <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
               v2.0 Beta
             </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
