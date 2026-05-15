import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background premium-grid p-4">
      <Card className="w-full max-w-md premium-card border-none bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription>
            Start tracking your finances smartly today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="John Doe"
                required
                className="rounded-xl h-12 border-border bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-xl h-12 border-border bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-xl h-12 border-border bg-transparent"
              />
            </div>
            {searchParams?.message && (
              <p className="text-sm font-medium text-destructive text-center">
                {searchParams.message}
              </p>
            )}
            <Button formAction={signup} className="w-full h-12 rounded-xl font-bold text-base mt-4">
              Get Started
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
          <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            © 2026 Finance — Powered by Sociusin
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
