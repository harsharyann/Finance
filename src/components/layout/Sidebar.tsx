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
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (data) setRole(data.role)
      }
    }
    getRole()
  }, [])

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
          <h3 className="px-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
            {group.section}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                  isActive(item.href)
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive(item.href) ? "text-white" : "text-muted-foreground/70 group-hover:text-primary"
                )} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none">{item.name}</span>
                  <span className={cn(
                    "text-[10px] font-medium mt-1 transition-colors",
                    isActive(item.href) ? "text-white/70" : "text-muted-foreground/50 group-hover:text-primary/70"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* GHOST ADMIN SECTION */}
      {role === 'admin' && (
        <div className="pt-2">
          <h3 className="px-3 text-xs font-black uppercase tracking-[0.2em] text-primary/60 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Master Control
          </h3>
          <div className="space-y-1">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group border border-dashed border-primary/20",
                pathname === "/admin"
                  ? "bg-primary/10 text-primary border-primary/50"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">Admin Panel</span>
                <span className="text-[10px] font-medium mt-1 text-primary/50">Manage Users</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single()
        if (profile) setUserName(profile.name)
      }
    }
    getUser()
  }, [])

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/60">
      {/* LOGO */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight leading-none">Finance</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Powered by Sociusin</p>
          </div>
        </Link>
      </div>

      <Suspense fallback={<div className="flex-1" />}>
        <NavLinks />
      </Suspense>

      {/* FOOTER ACTIONS */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl h-11 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5 mr-3 text-amber-500" />
              <span className="text-sm font-bold">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 mr-3 text-primary" />
              <span className="text-sm font-bold">Dark Mode</span>
            </>
          )}
        </Button>

        <div className="pt-4 mt-4 border-t border-border/40">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black text-xs uppercase">
              {userName?.[0] || userEmail?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-foreground truncate">{userName || "User"}</p>
              <p className="text-[10px] font-bold text-muted-foreground truncate">{userEmail}</p>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-all">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
