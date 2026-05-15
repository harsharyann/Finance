"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { CalendarDays, Bell, Clock, Plus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function BillsPage() {
  const upcomingBills = [
    { name: "Rent Payment", amount: "₹15,000", date: "May 20, 2026", category: "Housing", status: "upcoming" },
    { name: "Electricity Bill", amount: "₹2,450", date: "May 22, 2026", category: "Utilities", status: "due" },
    { name: "Netflix Subscription", amount: "₹499", date: "May 25, 2026", category: "Entertainment", status: "upcoming" },
  ]

  return (
    <AppLayout>
      <div className="space-y-8 animate-in-fade">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-black text-foreground">Bills & Reminders</h1>
            <p className="text-muted-foreground mt-1">Never miss a payment again.</p>
          </div>
          <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add New Reminder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card className="premium-card bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-black text-foreground">₹17,949</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due this week</p>
                  <p className="text-2xl font-black text-foreground">2 Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid this month</p>
                  <p className="text-2xl font-black text-foreground">₹4,200</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Upcoming Payments</h2>
          <div className="grid gap-4">
            {upcomingBills.map((bill, i) => (
              <div 
                key={i} 
                className="group flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <CalendarDays className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{bill.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {bill.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {bill.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground">{bill.amount}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                    bill.status === 'due' ? 'text-rose-500' : 'text-primary'
                  }`}>
                    {bill.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State / Coming Soon message */}
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm">
            <Bell className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <div>
            <h3 className="text-lg font-bold">More features coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We're building automated bill fetching and SMS alerts to make your life easier.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
