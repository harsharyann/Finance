import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  ChevronRight,
  LogOut
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { signOut } from "@/app/auth/actions"

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and app preferences.</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <Card className="premium-card border-none bg-white">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold">
                  JD
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="rounded-xl h-9">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="john@example.com" className="rounded-xl h-11" />
                </div>
              </div>
              <Button className="rounded-xl px-8">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <div className="grid md:grid-cols-2 gap-6">
             <Card className="premium-card border-none bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {[
                     { title: "Push Notifications", icon: Bell, default: true },
                     { title: "Email Weekly Reports", icon: Globe, default: true },
                     { title: "Two-Factor Auth", icon: Shield, default: false }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <item.icon className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        <Switch defaultChecked={item.default} />
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="premium-card border-none bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Currency & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <Label>Primary Currency</Label>
                      <Button variant="outline" className="w-full justify-between rounded-xl h-11">
                        <span>INR (₹) - Indian Rupee</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Button>
                   </div>
                   <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Button variant="outline" className="w-full justify-between rounded-xl h-11">
                        <span>DD/MM/YYYY</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Danger Zone */}
          <Card className="premium-card border-none bg-rose-50/50 border border-rose-100">
            <CardHeader>
              <CardTitle className="text-rose-600">Danger Zone</CardTitle>
              <CardDescription>Actions that cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <form action={signOut} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100 h-11 gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout from all devices
                </Button>
              </form>
              <Button variant="destructive" className="flex-1 rounded-xl h-11">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
