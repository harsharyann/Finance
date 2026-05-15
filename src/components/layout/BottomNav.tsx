"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  Settings,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"

const navItems = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "Txns", href: "/transactions", icon: Wallet },
  { name: "Report", href: "/reports", icon: BarChart3 },
  { name: "Setup", href: "/settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 pb-safe z-50">
      {navItems.slice(0, 2).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </Link>
      ))}

      <AddTransactionModal>
        <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white -mt-8 shadow-lg shadow-primary/20">
          <Plus className="w-6 h-6" />
        </button>
      </AddTransactionModal>

      {navItems.slice(2).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </Link>
      ))}
    </div>
  )
}
