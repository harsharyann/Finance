"use client"

import { Suspense, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { SpendingAnalysis } from "@/components/dashboard/SpendingAnalysis"
import { PaymentBreakdown } from "@/components/dashboard/PaymentBreakdown"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { useSearchParams } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const periodTabs = [
  { label: "Today",      view: "daily" },
  { label: "This Week",  view: "weekly" },
  { label: "This Month", view: "monthly" },
  { label: "All Time",   view: "all" },
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view") || "daily"
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="space-y-8">
      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="animate-in-fade">
          <h1 className="text-2xl font-heading font-black text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time overview of your business health.</p>
        </div>
        <div className="animate-in-fade stagger-1">
          <AddTransactionModal onTransactionAdded={handleRefresh}>
            <button className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95">
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </AddTransactionModal>
        </div>
      </div>

      {/* === PERIOD TABS === */}
      <div className="animate-in-fade stagger-1">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-2xl border border-border/50">
          {periodTabs.map((tab) => {
            const isActive = view === tab.view
            return (
              <Link
                key={tab.view}
                href={tab.view === "daily" ? "/dashboard" : `/dashboard?view=${tab.view}`}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-background text-primary shadow-lg shadow-black/5 border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* === STAT CARDS === */}
      <div key={`${view}-${refreshKey}`} className="animate-in-fade stagger-2">
        <DashboardStats key={refreshKey} />
      </div>

      {/* === CHARTS ROW === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-fade stagger-3">
        <div className="lg:col-span-2">
          <OverviewChart key={refreshKey} />
        </div>
        <div>
          <PaymentBreakdown key={refreshKey} />
        </div>
      </div>

      {/* === BOTTOM ROW === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in-fade stagger-4">
        <SpendingAnalysis key={refreshKey} />
        <RecentTransactions key={refreshKey} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30">Loading Dashboard...</p>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  )
}
