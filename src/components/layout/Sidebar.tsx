"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  PlusCircle,
  CalendarDays,
  CalendarRange,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/app/auth/actions"
import { useTheme } from "@/context/ThemeContext"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Weekly", href: "/dashboard?view=weekly", icon: CalendarRange },
  { name: "Monthly", href: "/dashboard?view=monthly", icon: CalendarDays },
  { name: "Transactions", href: "/transactions", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Must be a separate component so useSearchParams is inside its own Suspense
function NavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function isActive(href: string) {
    const [path, query] = href.split("?")
    if (query) {
      const param = new URLSearchParams(query)
      return pathname === path && searchParams.get("view") === param.get("view")
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard" && !searchParams.get("view")
    }
    return pathname === path
  }

  return (
    <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 pb-2 pt-3">Menu</p>
      {navItems.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "")} />
            {item.name}
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    getUser()
  }, [])

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border flex-shrink-0">
        <img src="/logo.png" className="w-9 h-9 object-contain flex-shrink-0" alt="Logo" />
        <div>
          <h1 className="font-heading font-black text-base text-foreground leading-none">Finance</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] mt-0.5">Sociusin</p>
        </div>
      </div>

      {/* Quick Add */}
      <div className="px-3 pt-4 pb-2 flex-shrink-0">
        <AddTransactionModal>
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
            <PlusCircle className="w-4 h-4" />
            Add Transaction
          </button>
        </AddTransactionModal>
      </div>

      {/* Nav wrapped in Suspense — required by Next.js for useSearchParams */}
      <Suspense fallback={
        <div className="flex-1 px-3 pt-4 space-y-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <NavLinks />
      </Suspense>

      {/* Bottom user section */}
      <div className="px-3 pb-4 pt-3 border-t border-border space-y-1 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase flex-shrink-0">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-none">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Loading..."}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email || ""}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
