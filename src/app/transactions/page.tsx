"use client"

import { Suspense } from "react"
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  Loader2
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function TransactionsContent() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage and track all your money movements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <AddTransactionModal />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10 rounded-xl h-11 border-none bg-white shadow-sm"
          />
        </div>
        <Button variant="outline" className="rounded-xl h-11 justify-start gap-2 bg-white shadow-sm px-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>Select Date</span>
        </Button>
        <Button variant="outline" className="rounded-xl h-11 justify-start gap-2 bg-white shadow-sm px-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span>All Categories</span>
        </Button>
      </div>

      {/* Table */}
      <TransactionTable />
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <TransactionsContent />
      </Suspense>
    </AppLayout>
  )
}
