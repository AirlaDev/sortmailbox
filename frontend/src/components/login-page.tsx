import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface LoginPageProps {
  onNavigate: (page: "dashboard" | "history" | "settings" | "login") => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Por favor, insira seu email")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Login realizado com sucesso!")
      onNavigate("dashboard")
    }, 1000)
  }

  const handleSkip = () => {
    toast.info("Você pode continuar sem fazer login")
    onNavigate("dashboard")
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background/95 pointer-events-none -z-10" />
      <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8 flex flex-col min-h-screen justify-center">
        <Button
          variant="ghost"
          onClick={() => onNavigate("dashboard")}
          className="mb-4 self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg w-full">
          <CardHeader className="space-y-1 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-center">
              Com login: histórico na nuvem, preferências sincronizadas e relatórios exportáveis. Opcional.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="w-full"
                >
                  Continuar sem login
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                O login é opcional. Você pode usar o SortMailBox sem criar uma conta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
