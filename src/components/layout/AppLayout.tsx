import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
