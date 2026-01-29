import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/components/providers/settings-provider"
import { Moon, Sun, Clock, Info } from "lucide-react"
import { DEFAULT_MINUTES_PER_EMAIL } from "@/lib/settings"
import { toast } from "sonner"

const APP_VERSION = "1.0.0"

interface SettingsPageProps {
  onNavigate: (page: "dashboard" | "history" | "settings" | "login") => void
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { minutesPerEmail, setMinutesPerEmail, theme, setTheme } = useSettings()

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.valueAsNumber
    if (!Number.isNaN(v)) setMinutesPerEmail(v)
  }

  const handleMinutesBlur = () => {
    const n = Math.max(1, Math.min(60, Math.round(minutesPerEmail)))
    if (n !== minutesPerEmail) setMinutesPerEmail(n)
    toast.success("Configuração salva.")
  }

  return (
    <MainLayout activeItem="settings" onNavigate={onNavigate}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate min-w-0">
          Configurações
        </h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tempo estimado por email
            </CardTitle>
            <CardDescription>
              Usado no cálculo do &quot;Tempo Estimado Economizado&quot; no dashboard. Quantos minutos
              em média você economiza ao classificar um email com a IA?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-[180px]">
              <Label htmlFor="minutes-per-email">Minutos por email</Label>
              <Input
                id="minutes-per-email"
                type="number"
                min={1}
                max={60}
                value={minutesPerEmail}
                onChange={handleMinutesChange}
                onBlur={handleMinutesBlur}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Padrão: {DEFAULT_MINUTES_PER_EMAIL} min. Entre 1 e 60.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Tema
            </CardTitle>
            <CardDescription>
              Escolha o tema claro ou escuro da interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Escuro
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Sobre o SortMailBox
            </CardTitle>
            <CardDescription>
              Classificador de emails com IA. Versão {APP_VERSION}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              O SortMailBox usa inteligência artificial para classificar emails em produtivos ou
              improdutivos e sugerir respostas. Você pode usar sem login; o histórico fica no
              navegador.
            </p>
            <p>
              Para histórico na nuvem, preferências sincronizadas e relatórios, faça login em
              Usuário no menu.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
