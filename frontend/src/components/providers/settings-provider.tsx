import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  getMinutesPerEmail,
  getTheme,
  setMinutesPerEmail as persistMinutes,
  setTheme as persistTheme,
  type Theme,
} from "@/lib/settings"

interface SettingsContextValue {
  minutesPerEmail: number
  setMinutesPerEmail: (v: number) => void
  theme: Theme
  setTheme: (v: Theme) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [minutesPerEmail, setMinutesPerEmailState] = useState(getMinutesPerEmail)
  const [theme, setThemeState] = useState<Theme>(getTheme)

  const setMinutesPerEmail = useCallback((v: number) => {
    const n = Math.max(1, Math.min(60, Math.round(v)))
    persistMinutes(n)
    setMinutesPerEmailState(n)
  }, [])

  const setTheme = useCallback((v: Theme) => {
    persistTheme(v)
    setThemeState(v)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.body.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <SettingsContext.Provider
      value={{ minutesPerEmail, setMinutesPerEmail, theme, setTheme }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
