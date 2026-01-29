import { useState, useCallback, useMemo } from "react"
import {
  Mail,
  Clock,
  Cpu,
  Upload,
  Copy,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  ListOrdered,
  List,
  Image as ImageIcon
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ClassificationHistory } from "@/components/classification-history"
import { emailService } from "@/services/api"
import { EmailClassificationResponse } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DashboardProps {
  onNavigate?: (page: "dashboard" | "history" | "settings" | "login") => void
  sharedHistory?: Array<EmailClassificationResponse & { subject?: string }>
  onHistoryUpdate?: (history: Array<EmailClassificationResponse & { subject?: string }>) => void
}

export function Dashboard({ onNavigate, sharedHistory = [], onHistoryUpdate }: DashboardProps) {
  const [emailContent, setEmailContent] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [classificationResult, setClassificationResult] = useState<EmailClassificationResponse | null>(null)
  const [smartReply, setSmartReply] = useState("")
  const [localHistory, setLocalHistory] = useState<Array<EmailClassificationResponse & { subject?: string }>>([])

  const history = sharedHistory.length > 0 ? sharedHistory : localHistory

  const updateHistory = useCallback((newItem: EmailClassificationResponse & { subject?: string }) => {
    if (sharedHistory.length > 0) {
      const updatedHistory = [newItem, ...sharedHistory]
      if (onHistoryUpdate) {
        onHistoryUpdate(updatedHistory)
      }
    } else {
      setLocalHistory(prev => {
        const updatedHistory = [newItem, ...prev]
        if (onHistoryUpdate) {
          onHistoryUpdate(updatedHistory)
        }
        return updatedHistory
      })
    }
  }, [sharedHistory, onHistoryUpdate])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".pdf")) {
      setIsLoading(true)
      try {
        const result = await emailService.classifyFile(file, emailSubject || undefined)
        setClassificationResult(result)
        setSmartReply(result.suggested_response)
        updateHistory({ ...result, subject: emailSubject || undefined })
        toast.success("Email classificado com sucesso!")
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Erro ao classificar email")
      } finally {
        setIsLoading(false)
      }
    } else {
      toast.error("Formato não suportado. Use arquivos .txt ou .pdf")
    }
  }, [emailSubject, updateHistory])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".pdf")) {
      setIsLoading(true)
      try {
        const result = await emailService.classifyFile(file, emailSubject || undefined)
        setClassificationResult(result)
        setSmartReply(result.suggested_response)
        updateHistory({ ...result, subject: emailSubject || undefined })
        toast.success("Email classificado com sucesso!")
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Erro ao classificar email")
      } finally {
        setIsLoading(false)
      }
    } else {
      toast.error("Formato não suportado. Use arquivos .txt ou .pdf")
    }
  }, [emailSubject, updateHistory])

  const handleClassify = async () => {
    if (!emailContent.trim()) {
      toast.error("Por favor, insira o conteúdo do email")
      return
    }
    setIsLoading(true)
    try {
      const result = await emailService.classifyText({
        content: emailContent,
        subject: emailSubject || undefined
      })
      setClassificationResult(result)
      setSmartReply(result.suggested_response)
      updateHistory({ ...result, subject: emailSubject || undefined })
      toast.success("Email classificado com sucesso!")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao classificar email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyResponse = () => {
    if (!smartReply) return
    navigator.clipboard.writeText(smartReply)
    toast.success("Resposta copiada para a área de transferência!")
  }

  const handleOpenInGmail = () => {
    if (!smartReply) return
    const subject = encodeURIComponent(emailSubject || "Re: Email")
    const body = encodeURIComponent(smartReply)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`, "_blank")
  }

  const confidencePercentage = classificationResult
    ? Math.round(classificationResult.confidence * 100)
    : 0

  const metrics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const emailsToday = history.filter((item) => {
      const itemDate = new Date(item.processed_at)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime()
    }).length
    const timeSavedMinutes = emailsToday * 2
    const timeSavedHours = Math.floor(timeSavedMinutes / 60)
    const timeSavedMins = timeSavedMinutes % 60
    const timeSavedFormatted = timeSavedHours > 0
      ? `${timeSavedHours}h ${timeSavedMins}m`
      : `${timeSavedMinutes}m`
    const avgConfidence = history.length > 0
      ? Math.round(
        (history.reduce((sum, item) => sum + item.confidence, 0) / history.length) * 100
      )
      : 94
    return {
      emailsToday,
      timeSaved: timeSavedFormatted,
      accuracy: avgConfidence,
    }
  }, [history])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeItem="dashboard" onNavigate={onNavigate} />
      <main className="flex-1 ml-64 overflow-y-auto bg-background relative">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background/95 pointer-events-none -z-10" />
        <div className="container mx-auto p-6 space-y-6 relative z-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Emails Processados Hoje
                    </p>
                    <p className="text-3xl font-bold text-foreground">{metrics.emailsToday}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Tempo Estimado Economizado
                    </p>
                    <p className="text-3xl font-bold text-foreground">{metrics.timeSaved}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/80 backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Precisão da IA
                    </p>
                    <p className="text-3xl font-bold text-foreground">{metrics.accuracy}%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entrada de Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer relative",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                      isDragging ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Upload className={cn(
                        "h-6 w-6 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Arraste o conteúdo do email
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou clique para selecionar arquivo (.txt ou .pdf)
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Assunto (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Project Update"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Conteúdo do Email
                  </label>
                  <Textarea
                    placeholder="Cole o conteúdo do email aqui..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                <Button
                  onClick={handleClassify}
                  disabled={!emailContent.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Classificando..." : "Classificar Email"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Análise IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </div>
                ) : classificationResult ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={classificationResult.category === "Produtivo" ? "productive" : "unproductive"}
                          className="text-sm px-3 py-1"
                        >
                          {classificationResult.category === "Produtivo"
                            ? "Produtivo - Ação Necessária"
                            : "Improdutivo"}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Score de Confiança</p>
                        <CircularProgress value={confidencePercentage} size={120} strokeWidth={8} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        Editor de Resposta Inteligente
                      </h4>
                      <div className="flex items-center gap-1 rounded-t-lg border border-b-0 bg-muted/50 p-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Negrito"
                        >
                          <Bold className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Itálico"
                        >
                          <Italic className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Sublinhado"
                        >
                          <Underline className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div className="mx-1 h-6 w-px bg-border" />
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Link"
                        >
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Lista Numerada"
                        >
                          <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Lista com Marcadores"
                        >
                          <List className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                          title="Imagem"
                        >
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <Textarea
                        value={smartReply}
                        onChange={(e) => setSmartReply(e.target.value)}
                        className="min-h-[150px] rounded-t-none border-t-0 resize-none"
                        placeholder="A resposta sugerida aparecerá aqui..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleCopyResponse}
                        className="flex-1"
                        disabled={!smartReply}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Resposta
                      </Button>
                      <Button
                        onClick={handleOpenInGmail}
                        className="flex-1"
                        disabled={!smartReply}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir no Gmail
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">Nenhum resultado ainda. Classifique um email para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <ClassificationHistory history={history} limit={3} />
        </div>
      </main>
    </div>
  )
}
