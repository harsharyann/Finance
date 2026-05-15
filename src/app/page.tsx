"use client"

import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, BarChart3, Zap, Moon, Sun } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const features = [
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    desc: "Monitor cash flow with live charts and instant profit/loss snapshots."
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade Security",
    desc: "Your data is protected with Supabase's enterprise-grade infrastructure."
  },
  {
    icon: BarChart3,
    title: "Smart Reports",
    desc: "Monthly business reports with one-click PDF export for your records."
  },
  {
    icon: Zap,
    title: "Instant Entry",
    desc: "Add transactions in seconds. Custom categories, descriptions, and more."
  },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-500">

      {/* === NAVBAR === */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
               <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-xl text-foreground tracking-tight leading-none block">Finance</span>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black leading-none mt-1">Sociusin</p>
            </div>
          </div>

          <nav className="flex items-center gap-4 sm:gap-8">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Features</a>
              <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Login</Link>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:flex rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/25")}>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* === HERO === */}
      <section className="pt-44 pb-32 px-6 premium-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-10 border border-primary/20 animate-in-fade">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Live: Tracking ₹ Smarter
          </div>

          <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tight mb-8 text-foreground leading-[0.95] animate-in-slide-up">
            Track Every Rupee.<br />
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Grow Every Day.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            The ultimate financial operating system for Indian shopkeepers and small business owners. Manage cash flow with absolute clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in-fade">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-2xl px-10 h-14 text-base font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all gap-3 group")}>
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto rounded-2xl px-10 h-14 text-base font-bold bg-background/50 backdrop-blur-sm border-2 hover:bg-muted")}>
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-16 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
            {["No credit card", "Free forever", "Secure & Private"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Core Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tight">Everything you need to scale</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-heading font-black text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-12 border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
               <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-black text-lg text-foreground tracking-tight">Finance</span>
          </div>
          
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 Finance — Powered by <span className="text-foreground">Sociusin</span>
          </p>

          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Terms</a>
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
