"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, BarChart3, Users, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "Txns",   href: "/transactions", icon: Wallet },
  { name: "Reports",href: "/reports",      icon: BarChart3 },
  { name: "Debts",  href: "/debts",        icon: Users },
  { name: "Bills",  href: "/bills",        icon: CalendarDays },
]

export function BottomNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-2xl">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200",
                active ? "bg-primary/15 scale-110" : "hover:bg-muted"
              )}>
                <item.icon className={cn("w-[18px] h-[18px] transition-transform", active ? "stroke-[2.5]" : "stroke-2")} />
              </div>
              <span className={cn(
                "text-[9px] font-bold tracking-wide transition-all",
                active ? "text-primary" : "text-muted-foreground/60"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
