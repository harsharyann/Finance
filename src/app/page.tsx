import Link from "next/link"
import { Wallet, CheckCircle2, ArrowRight, TrendingUp, ShieldCheck, Smartphone } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Finance</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-1 leading-none">
                Sociusin
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link 
              href="/login" 
              className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6")}
            >
              Get Started
            </Link>
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Smartphone className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Finance Powered by Sociusin
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            Track Every Rupee <br />
            <span className="text-primary">Smartly</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Finance Powered by Sociusin helps you manage income, expenses, and business cash flow effortlessly. Built for shopkeepers and small business owners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-lg h-14 group flex items-center justify-center")}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard" 
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 text-lg h-14 bg-white flex items-center justify-center")}
            >
              View Dashboard
            </Link>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full scale-90 opacity-50"></div>
            <div className="premium-card overflow-hidden border-4 border-white aspect-[16/10] shadow-2xl relative">
               {/* Mockup UI */}
               <div className="absolute inset-0 bg-slate-50 flex">
                  <div className="w-1/5 border-r bg-white p-4 hidden md:block">
                    <div className="w-12 h-2 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-4 bg-slate-100 rounded w-full"></div>)}
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between mb-8">
                      <div className="h-8 bg-slate-200 rounded w-32"></div>
                      <div className="h-8 bg-primary/20 rounded w-8"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-xl border p-3">
                          <div className="h-3 bg-slate-100 rounded w-12 mb-2"></div>
                          <div className="h-6 bg-slate-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-48 bg-white rounded-xl border p-4">
                      <div className="h-4 bg-slate-100 rounded w-32 mb-4"></div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/10 rounded-t-sm"></div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Everything You Need to Scale</h3>
          <p className="text-muted-foreground">Powerful features to help you keep your business healthy.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { title: "Real-time Analytics", icon: TrendingUp, desc: "Monitor your cash flow with beautiful, real-time charts and reports." },
            { title: "Smart Categories", icon: CheckCircle2, desc: "Automatically categorize your expenses for better financial insights." },
            { title: "Bank-grade Security", icon: ShieldCheck, desc: "Your data is encrypted and secure with Supabase's robust infrastructure." }
          ].map((f, i) => (
            <div key={i} className="premium-card p-8 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">{f.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto premium-card bg-primary p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take Control?</h3>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Join thousands of small business owners who trust Finance to manage their daily expenses and growth.
          </p>
          <Link 
            href="/register" 
            className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "rounded-full px-10 h-14 text-lg font-bold flex items-center justify-center")}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Finance — Powered by Sociusin
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
