export const SETTINGS_KEYS = {
  MINUTES_PER_EMAIL: "sortmailbox_minutes_per_email",
  THEME: "sortmailbox_theme",
} as const

export const DEFAULT_MINUTES_PER_EMAIL = 2
export const DEFAULT_THEME = "dark" as const

export type Theme = "light" | "dark"

export function getMinutesPerEmail(): number {
  if (typeof window === "undefined") return DEFAULT_MINUTES_PER_EMAIL
  const v = localStorage.getItem(SETTINGS_KEYS.MINUTES_PER_EMAIL)
  const n = parseInt(v ?? "", 10)
  return Number.isNaN(n) || n < 1 ? DEFAULT_MINUTES_PER_EMAIL : Math.min(n, 60)
}

export function setMinutesPerEmail(value: number): void {
  const n = Math.max(1, Math.min(60, Math.round(value)))
  localStorage.setItem(SETTINGS_KEYS.MINUTES_PER_EMAIL, String(n))
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME
  const v = localStorage.getItem(SETTINGS_KEYS.THEME) as Theme | null
  return v === "light" || v === "dark" ? v : DEFAULT_THEME
}

export function setTheme(value: Theme): void {
  localStorage.setItem(SETTINGS_KEYS.THEME, value)
}
