import { CheckCircle2, XCircle, Copy, RotateCcw, Clock, TrendingUp, MessageSquare, FileText } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { EmailClassificationResponse } from "@/types"
import { formatDate, truncateText, cn } from "@/lib/utils"

interface ResultDisplayProps {
  result: EmailClassificationResponse | null
  isLoading: boolean
  onReset: () => void
}

export function ResultDisplay({ result, isLoading, onReset }: ResultDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Resposta copiada para a área de transferência!")
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
            Resultado da Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Analisando email...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Nossa IA está processando o conteúdo
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resultado da Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhum email analisado</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Envie um email no formulário ao lado para ver a classificação e a resposta sugerida
          </p>
        </CardContent>
      </Card>
    )
  }

  const isProductive = result.category === "Produtivo"
  const confidencePercent = Math.round(result.confidence * 100)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resultado da Classificação
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Nova análise
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn(
          "rounded-lg p-4",
          isProductive ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isProductive ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-amber-600" />
              )}
              <span className={cn(
                "font-semibold text-lg",
                isProductive ? "text-green-800" : "text-amber-800"
              )}>
                {result.category}
              </span>
            </div>
            <Badge variant={isProductive ? "productive" : "unproductive"}>
              {isProductive ? "Requer Ação" : "Sem Ação"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={isProductive ? "text-green-700" : "text-amber-700"}>
                Nível de Confiança
              </span>
              <span className={cn(
                "font-medium",
                isProductive ? "text-green-800" : "text-amber-800"
              )}>
                {confidencePercent}%
              </span>
            </div>
            <Progress
              value={confidencePercent}
              className={cn(
                "h-2",
                isProductive ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
              )}
            />
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Email Original (resumo)</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="text-foreground/80 leading-relaxed">
              {truncateText(result.original_content, 200)}
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Resposta Sugerida</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(result.suggested_response)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {result.suggested_response}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Clock className="h-3 w-3" />
          <span>Processado em: {formatDate(result.processed_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
