import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md premium-card border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Authentication Error</CardTitle>
          <CardDescription>
            We couldn't verify your session. This usually happens if the link has expired or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Please try signing in again. If you're using a magic link, make sure you're using the most recent one sent to your email.
          </p>
          <Link href="/login">
            <Button className="w-full h-12 rounded-xl font-bold text-base gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            © 2026 Finance — Powered by Sociusin
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
