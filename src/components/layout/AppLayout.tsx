import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background premium-grid">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
