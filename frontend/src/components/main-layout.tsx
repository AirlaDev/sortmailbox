import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  activeItem: "dashboard" | "history" | "settings"
  onNavigate: (page: "dashboard" | "history" | "settings" | "login") => void
  children: React.ReactNode
}

export function MainLayout({ activeItem, onNavigate, children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavigate = (page: "dashboard" | "history" | "settings" | "login") => {
    setSidebarOpen(false)
    onNavigate(page)
  }

  return (
    <div className="flex h-screen bg-background overflow-x-hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <Sidebar
        activeItem={activeItem}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 min-w-0 ml-0 md:ml-64 overflow-y-auto overflow-x-hidden bg-background relative flex flex-col">
        {/* Header móvel com hamburger */}
        <header className="sticky top-0 z-20 flex md:hidden h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors -ml-1"
            aria-label="Abrir menu"
          >
            <svg className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-foreground truncate">SortMailBox</span>
        </header>
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background/95 pointer-events-none -z-10" />
        <div className="container mx-auto w-full max-w-full flex-1 px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 relative z-0">
          {children}
        </div>
      </main>
    </div>
  )
}
