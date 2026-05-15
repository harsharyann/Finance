"use client"

import { Suspense } from "react"
import { Download, Plus, Loader2 } from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"

function TransactionsContent() {
  return (
    <div className="space-y-6">

      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in-fade">
        <div>
          <h1 className="text-2xl font-heading font-black text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track all your money movements</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            <Download className="w-4 h-4 text-muted-foreground" />
            Export CSV
          </button>
          <AddTransactionModal>
            <button className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </AddTransactionModal>
        </div>
      </div>

      {/* === TABLE COMPONENT === */}
      <div className="animate-in-fade stagger-1">
        <TransactionTable />
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <TransactionsContent />
      </Suspense>
    </AppLayout>
  )
}
