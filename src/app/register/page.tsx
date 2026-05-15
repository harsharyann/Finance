"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* === LEFT FORM PANEL === */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/logo.png" className="w-9 h-9 object-contain" alt="Logo" />
            <span className="font-heading font-black text-xl text-foreground">Finance</span>
          </div>

          <h2 className="text-3xl font-heading font-black text-foreground mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8">Start tracking your finances for free today</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Full name</label>
              <input
                {...register("full_name")}
                type="text"
                placeholder="Harsh Aryan"
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
              {errors.full_name && <p className="mt-1.5 text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* === RIGHT BRAND PANEL === */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mb-32" />

        <div className="relative text-center">
          <img src="/logo.png" className="w-20 h-20 object-contain mx-auto mb-8 drop-shadow-xl" alt="Logo" />
          <h2 className="text-4xl font-heading font-black text-white mb-4">Your business finances, simplified.</h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm mx-auto">
            Join thousands of shopkeepers and business owners who trust Finance to track every rupee.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: "Transactions tracked", value: "10k+" },
              { label: "Active users", value: "500+" },
              { label: "Reports generated", value: "2k+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-heading font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
