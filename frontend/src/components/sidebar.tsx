import { LayoutDashboard, History, Settings, Mail, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem?: "dashboard" | "history" | "settings"
  onNavigate?: (page: "dashboard" | "history" | "settings" | "login") => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ activeItem = "dashboard", onNavigate, isOpen = false, onClose }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "Histórico", icon: History },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-64 border-r border-border bg-secondary z-40 transition-transform duration-200 ease-out",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground truncate">SortMailBox</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id as "dashboard" | "history" | "settings")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left",
                  isActive
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={() => onNavigate?.("login")}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full hover:bg-accent transition-colors text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Usuário</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
