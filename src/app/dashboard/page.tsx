"use client"

import { Suspense } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { SpendingAnalysis } from "@/components/dashboard/SpendingAnalysis"
import { PaymentBreakdown } from "@/components/dashboard/PaymentBreakdown"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { Button } from "@/components/ui/button"
import { Filter, Loader2 } from "lucide-react"

import { useSearchParams } from "next/navigation"

function DashboardContent() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'daily'

  return (
    <div className="space-y-8" key={view}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in-fade">
        <div>
          <h2 className="text-3xl font-black tracking-tight font-heading">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your money.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 hidden sm:flex bg-card">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <AddTransactionModal />
        </div>
      </div>

      <DashboardStats />

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SpendingAnalysis />
        <PaymentBreakdown />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <OverviewChart />
        <RecentTransactions />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  )
}
