"use client"

import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, BarChart3, Zap } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* === NAVBAR === */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border overflow-hidden">
              <img src="/logo.png" className="w-6 h-6 object-contain" alt="Finance Logo" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-foreground leading-none">Finance</span>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] leading-none mt-0.5">Sociusin</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "rounded-xl px-5 font-semibold")}>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* === HERO === */}
      <section className="pt-40 pb-28 px-6 premium-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/0 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            Now tracking ₹ smarter than ever
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight mb-6 text-foreground leading-[1.05]">
            Track Every Rupee.<br />
            <span className="text-primary">Grow Every Day.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Finance Powered by Sociusin helps shopkeepers and small business owners manage income, expenses, and business cash flow — effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-8 h-13 text-base font-bold gap-2 group")}>
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl px-8 h-13 text-base font-medium")}>
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            {["No credit card required", "Free forever for basics", "Secure & private"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-3">Why Finance?</p>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-foreground mb-4">Everything you need to scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Powerful features built specifically for Indian shopkeepers and small business owners.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-foreground mb-4">Ready to take control?</h2>
          <p className="text-muted-foreground mb-8 text-lg">Join thousands of business owners tracking their finances the smart way.</p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-10 h-13 text-base font-bold")}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border overflow-hidden">
              <img src="/logo.png" className="w-5 h-5 object-contain" alt="Logo" />
            </div>
            <span className="font-heading font-bold text-foreground">Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Finance — Powered by Sociusin</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
