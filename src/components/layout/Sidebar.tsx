"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Sun
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/app/auth/actions"
import { useTheme } from "@/context/ThemeContext"

const navItems = [
  { name: "Daily Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Weekly Analysis", href: "/dashboard?view=weekly", icon: CalendarRange },
  { name: "Monthly Trends", href: "/dashboard?view=monthly", icon: CalendarDays },
  { name: "All Transactions", href: "/transactions", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r bg-card p-4 transition-colors">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-card-foreground">Finance</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-1 leading-none">
            Powered by Sociusin
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              pathname === item.href 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border space-y-4">
        <Button 
          variant="ghost" 
          onClick={toggleTheme} 
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>

        <AddTransactionModal>
          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-dashed bg-transparent border-border hover:bg-secondary">
            <PlusCircle className="w-5 h-5" />
            Quick Add
          </Button>
        </AddTransactionModal>
        
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-border" alt="User" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
              {user?.email?.[0] || 'D'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-card-foreground">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
          <button onClick={() => signOut()} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
