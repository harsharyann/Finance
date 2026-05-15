"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, BarChart3, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"

const leftNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Txns", href: "/transactions", icon: Wallet },
]
const rightNav = [
  { name: "Debts", href: "/debts", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">

        {/* Left items */}
        {leftNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 rounded-xl transition-colors",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              isActive(item.href) ? "bg-primary/10" : ""
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        ))}

        {/* Centre FAB */}
        <AddTransactionModal>
          <button className="flex items-center justify-center w-13 h-13 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 -mt-5 hover:bg-primary/90 active:scale-95 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </AddTransactionModal>

        {/* Right items */}
        {rightNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 rounded-xl transition-colors",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              isActive(item.href) ? "bg-primary/10" : ""
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        ))}

        {/* Placeholder for symmetry */}

      </div>
    </nav>
  )
}
