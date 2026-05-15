"use client"

import { useState, Suspense } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { MonthlyReport } from "@/components/reports/MonthlyReport"
import { DailyReport } from "@/components/reports/DailyReport"
import { Loader2, CalendarDays, CalendarRange } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"monthly" | "daily">("monthly")

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in-fade">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <span className="w-8 h-px bg-primary/30" />
              Analytics
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Business Reports</h1>
            <p className="text-muted-foreground font-medium">Insights into your financial performance.</p>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center bg-muted/50 p-1 rounded-2xl border border-border/50">
            <button
              onClick={() => setActiveTab("monthly")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "monthly" 
                  ? "bg-background text-primary shadow-lg shadow-black/5 border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarRange className="w-4 h-4" />
              Monthly
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "daily" 
                  ? "bg-background text-primary shadow-lg shadow-black/5 border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Daily
            </button>
          </div>
        </div>

        <div className="min-h-[600px]">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">Generating Insights...</p>
            </div>
          }>
            {activeTab === "monthly" ? <MonthlyReport /> : <DailyReport />}
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
