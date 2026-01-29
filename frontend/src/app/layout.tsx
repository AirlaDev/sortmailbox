import { ReactNode, useEffect } from "react"
import "./globals.css"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers/query-provider"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  }, [])

  return (
    <QueryProvider>
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  )
}
