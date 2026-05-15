"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { MonthlyReport } from "@/components/reports/MonthlyReport"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
          <MonthlyReport />
        </Suspense>
      </div>
    </AppLayout>
  )
}
