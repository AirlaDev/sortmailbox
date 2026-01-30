import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { HistoryPage } from "@/components/history-page"
import { LoginPage } from "@/components/login-page"
import { SettingsPage } from "@/components/settings-page"
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
        <SettingsPage onNavigate={handleNavigate} />
      )}
      {currentPage === "login" && (
        <LoginPage onNavigate={handleNavigate} />
      )}
    </>
  )
}
