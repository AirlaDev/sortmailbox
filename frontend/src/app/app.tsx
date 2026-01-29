import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { HistoryPage } from "@/components/history-page"
import { LoginPage } from "@/components/login-page"
import { Sidebar } from "@/components/sidebar"
import { EmailClassificationResponse } from "@/types"

type Page = "dashboard" | "history" | "settings" | "login"

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sharedHistory, setSharedHistory] = useState<Array<EmailClassificationResponse & { subject?: string }>>([])

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleHistoryUpdate = (history: Array<EmailClassificationResponse & { subject?: string }>) => {
    setSharedHistory(history)
  }

  return (
    <>
      {currentPage === "dashboard" && (
        <Dashboard
          onNavigate={handleNavigate}
          sharedHistory={sharedHistory}
          onHistoryUpdate={handleHistoryUpdate}
        />
      )}
      {currentPage === "history" && (
        <HistoryPage
          history={sharedHistory}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === "settings" && (
        <div className="flex h-screen bg-background">
          <Sidebar activeItem="settings" onNavigate={handleNavigate} />
          <div className="flex-1 ml-64 p-6">
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-4">Página de configurações em desenvolvimento.</p>
          </div>
        </div>
      )}
      {currentPage === "login" && (
        <LoginPage onNavigate={handleNavigate} />
      )}
    </>
  )
}
