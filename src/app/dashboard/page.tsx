"use client"

import { Suspense } from "react"
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

  return (
    <div className="space-y-8">
      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="animate-in-fade">
          <h1 className="text-2xl font-heading font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your money</p>
        </div>
        <div className="animate-in-fade stagger-1">
          <AddTransactionModal>
            <button className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </AddTransactionModal>
        </div>
      </div>

      {/* === PERIOD TABS === */}
      <div className="animate-in-fade stagger-1">
        <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-xl">
          {periodTabs.map((tab) => {
            const isActive = view === tab.view
            return (
              <Link
                key={tab.view}
                href={tab.view === "daily" ? "/dashboard" : `/dashboard?view=${tab.view}`}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-card text-foreground shadow-sm border border-border"
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
      <div key={view} className="animate-in-fade stagger-2">
        <DashboardStats />
      </div>

      {/* === CHARTS ROW === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-fade stagger-3">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div>
          <PaymentBreakdown />
        </div>
      </div>

      {/* === BOTTOM ROW === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in-fade stagger-4">
        <SpendingAnalysis />
        <RecentTransactions />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  )
}
