"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import {
  Loader2,
  FileDown,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MonthlyReport() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const firstDay = startOfMonth(now)
      const lastDay = endOfMonth(now)

      const { data: txns, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", format(firstDay, "yyyy-MM-dd"))
        .lte("date", format(lastDay, "yyyy-MM-dd"))
        .order("date", { ascending: true })

      if (error) throw error

      const all = txns || []
      const income = all.filter(t => t.type === "income").reduce((a, c) => a + c.amount, 0)
      const expense = all.filter(t => t.type === "expense").reduce((a, c) => a + c.amount, 0)

      // Category breakdown
      const cats: Record<string, number> = {}
      all.filter(t => t.type === "expense").forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount
      })
      const categories = Object.entries(cats)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => (b.amount as number) - (a.amount as number))

      setData({
        month: format(now, "MMMM yyyy"),
        generatedAt: format(new Date(), "dd MMMM yyyy, hh:mm a"),
        userName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Business Owner",
        totalIncome: income,
        totalExpense: expense,
        netProfit: income - expense,
        transactions: all,
        categories,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadPDF() {
    // Force light-mode print styles
    document.documentElement.classList.add("force-print-light")
    window.print()
    setTimeout(() => document.documentElement.classList.remove("force-print-light"), 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">No data available for this month.</div>
    )
  }

  return (
    <div className="space-y-6">

      {/* === SCREEN HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden animate-in-fade">
        <div>
          <h1 className="text-2xl font-heading font-black text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly P&L summary — {data.month}</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4" />
          Download Bahi-Khata PDF
        </button>
      </div>

      {/* === SCREEN: STAT CARDS === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden animate-in-fade stagger-1">
        <div className="bg-card border border-border border-l-4 border-l-emerald-500 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Income</p>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{data.totalIncome.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-card border border-border border-l-4 border-l-rose-500 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Expenses</p>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
            ₹{data.totalExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <div className={cn(
          "bg-card border border-border border-l-4 rounded-2xl p-5",
          data.netProfit >= 0 ? "border-l-primary" : "border-l-rose-500"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Net Profit / Loss</p>
          </div>
          <p className={cn("text-2xl font-black tabular-nums", data.netProfit >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400")}>
            {data.netProfit >= 0 ? "+" : "−"}₹{Math.abs(data.netProfit).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* === SCREEN: Category breakdown === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden animate-in-fade stagger-2">

        {/* Category spend */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Where did money go?</p>
          </div>
          <div className="p-5 space-y-3">
            {data.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses this month</p>
            ) : data.categories.map((cat: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums ml-3">
                      ₹{cat.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 dark:bg-rose-600 rounded-full"
                      style={{ width: `${Math.min(100, (cat.amount / data.totalExpense) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* P&L summary table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Profit & Loss Summary</p>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Total Income", value: data.totalIncome, color: "text-emerald-600 dark:text-emerald-400", positive: true },
              { label: "Total Expenses", value: data.totalExpense, color: "text-rose-600 dark:text-rose-400", positive: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  {row.positive
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-rose-500" />
                  }
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                </div>
                <p className={cn("text-sm font-black tabular-nums", row.color)}>
                  {row.positive ? "+" : "−"}₹{row.value.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <p className="text-sm font-black text-foreground">Net Profit / Loss</p>
              <p className={cn(
                "text-base font-black tabular-nums",
                data.netProfit >= 0 ? "text-primary" : "text-rose-600"
              )}>
                {data.netProfit >= 0 ? "+" : "−"}₹{Math.abs(data.netProfit).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* === PRINT-ONLY BAHI-KHATA LAYOUT (hidden on screen) === */}
      {/* ======================================================= */}
      <div className="hidden print:block" style={{ fontFamily: "Georgia, serif", color: "#111", background: "#fff", padding: "32px" }}>

        {/* Letterhead */}
        <div style={{ borderBottom: "3px double #E8642A", paddingBottom: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#E8642A", fontFamily: "Arial, sans-serif" }}>Finance</div>
              <div style={{ fontSize: "11px", color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by Sociusin</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Bahi-Khata Report</div>
              <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{data.month}</div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Generated: {data.generatedAt}</div>
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#555" }}>
            Account Holder: <strong>{data.userName}</strong>
          </div>
        </div>

        {/* P&L Summary Box */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Kul Amdani (Income)", value: data.totalIncome, color: "#059669" },
            { label: "Kul Kharch (Expenses)", value: data.totalExpense, color: "#E11D48" },
            { label: data.netProfit >= 0 ? "Net Munafa (Profit)" : "Net Nuksan (Loss)", value: Math.abs(data.netProfit), color: data.netProfit >= 0 ? "#E8642A" : "#E11D48" },
          ].map((s) => (
            <div key={s.label} style={{ border: `2px solid ${s.color}`, borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: s.color }}>₹{s.value.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        {data.categories.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px", color: "#333" }}>
              Kharch ka Vivaran (Expense Breakdown)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#FFF0E8" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>Category</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>Amount (₹)</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((cat: any, i: number) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #eee" }}>{cat.name}</td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", textAlign: "right", fontWeight: 700, color: "#E11D48" }}>
                      ₹{cat.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", textAlign: "right", color: "#666" }}>
                      {data.totalExpense > 0 ? ((cat.amount / data.totalExpense) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All Transactions Ledger */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px", color: "#333" }}>
            Puri Lenden (All Transactions)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#FFF0E8" }}>
                <th style={{ textAlign: "left", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Date</th>
                <th style={{ textAlign: "left", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Vivaran (Description)</th>
                <th style={{ textAlign: "left", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Category</th>
                <th style={{ textAlign: "left", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Method</th>
                <th style={{ textAlign: "right", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Jama (In ₹)</th>
                <th style={{ textAlign: "right", padding: "7px 8px", borderBottom: "1px solid #ddd" }}>Kharch (Out ₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t: any, i: number) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee" }}>{format(new Date(t.date), "dd/MM/yy")}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee" }}>{t.note || t.category}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee", color: "#666" }}>{t.category}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee", color: "#666" }}>{t.payment_method || "—"}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee", textAlign: "right", color: "#059669", fontWeight: 700 }}>
                    {t.type === "income" ? `₹${t.amount.toLocaleString("en-IN")}` : ""}
                  </td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid #eee", textAlign: "right", color: "#E11D48", fontWeight: 700 }}>
                    {t.type === "expense" ? `₹${t.amount.toLocaleString("en-IN")}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr style={{ background: "#FFF0E8", fontWeight: 700 }}>
                <td colSpan={4} style={{ padding: "8px", borderTop: "2px solid #E8642A", fontSize: "12px" }}>TOTAL</td>
                <td style={{ padding: "8px", borderTop: "2px solid #E8642A", textAlign: "right", color: "#059669" }}>
                  ₹{data.totalIncome.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "8px", borderTop: "2px solid #E8642A", textAlign: "right", color: "#E11D48" }}>
                  ₹{data.totalExpense.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "2px double #E8642A", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#999" }}>
          <span>Finance — Powered by Sociusin</span>
          <span>Confidential Business Report — {data.month}</span>
          <span>{data.generatedAt}</span>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .dark { background: #fff !important; }
          nav, aside, header, footer, [data-radix-portal] { display: none !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  )
}
