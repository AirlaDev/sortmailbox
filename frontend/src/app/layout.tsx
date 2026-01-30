import { ReactNode } from "react"
import "./globals.css"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers/query-provider"
import { SettingsProvider } from "@/components/providers/settings-provider"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <SettingsProvider>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </SettingsProvider>
  )
}
