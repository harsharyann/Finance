"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  CalendarDays,
  CalendarRange,
  Moon,
  Sun,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/app/auth/actions"
import { useTheme } from "@/context/ThemeContext"

const navItems = [
  {
    section: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Daily view" },
      { name: "Weekly", href: "/dashboard?view=weekly", icon: CalendarRange, description: "This week" },
      { name: "Monthly", href: "/dashboard?view=monthly", icon: CalendarDays, description: "This month" },
    ],
  },
  {
    section: "Finance",
    items: [
      { name: "Transactions", href: "/transactions", icon: Wallet, description: "All records" },
      { name: "Reports", href: "/reports", icon: BarChart3, description: "P&L analysis" },
      { name: "Bills", href: "/bills", icon: CalendarDays, description: "Reminders" },
    ],
  },
]

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
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
      {navItems.map((group) => (
        <div key={group.section}>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60 px-3 mb-2">
            {group.section}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                    active
                      ? "bg-primary text-white shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    active
                      ? "bg-white/20"
                      : "bg-muted group-hover:bg-background"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-sm font-semibold leading-none",
                      active ? "text-white" : "text-foreground"
                    )}>
                      {item.name}
                    </p>
                    <p className={cn(
                      "text-[11px] mt-0.5 leading-none",
                      active ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
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

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U"

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border">

      {/* === LOGO === */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-border overflow-hidden">
            <img src="/logo.png" className="w-7 h-7 object-contain" alt="Logo" />
          </div>
          <div>
            <h1 className="font-heading font-black text-base text-foreground leading-none">Finance</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-0.5 leading-none">Powered by Sociusin</p>
          </div>
        </div>
      </div>

      {/* === DIVIDER === */}
      <div className="mx-4 mb-3 h-px bg-border" />

      {/* === NAV === */}
      <Suspense fallback={
        <div className="flex-1 px-3 space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <NavLinks />
      </Suspense>

      {/* === DIVIDER === */}
      <div className="mx-4 mt-2 h-px bg-border" />

      {/* === BOTTOM SECTION === */}
      <div className="px-3 py-4 space-y-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 group"
        >
          <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-background flex items-center justify-center flex-shrink-0 transition-colors">
            {theme === "light"
              ? <Moon className="w-4 h-4" />
              : <Sun className="w-4 h-4" />
            }
          </div>
          <span className="text-sm font-semibold">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/60 border border-border mt-2">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase flex-shrink-0 border border-primary/20">
            {initials}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate leading-none">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Loading..."}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {user?.email || ""}
            </p>
          </div>
          {/* Logout */}
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
