import { useState, useCallback, useMemo, useEffect } from "react"
import {
  Mail,
  Clock,
  Upload,
  Copy,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  ListOrdered,
  List,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { useSettings } from "@/components/providers/settings-provider"
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
  const { minutesPerEmail } = useSettings()
  const [emailContent, setEmailContent] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [showOriginalEmail, setShowOriginalEmail] = useState(false)
  const [classificationResult, setClassificationResult] = useState<EmailClassificationResponse | null>(null)
  const [smartReply, setSmartReply] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [localHistory, setLocalHistory] = useState<Array<EmailClassificationResponse & { subject?: string }>>([])

  useEffect(() => {
    setShowOriginalEmail(false)
  }, [classificationResult?.processed_at])

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
    const timeSavedMinutes = emailsToday * minutesPerEmail
    const timeSavedHours = Math.floor(timeSavedMinutes / 60)
    const timeSavedMins = timeSavedMinutes % 60
    const timeSavedFormatted = timeSavedHours > 0
      ? `${timeSavedHours}h ${timeSavedMins}m`
      : `${timeSavedMinutes}m`
    return {
      emailsToday,
      timeSaved: timeSavedFormatted,
    }
  }, [history, minutesPerEmail])

  return (
    <MainLayout activeItem="dashboard" onNavigate={onNavigate!}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate min-w-0">Dashboard</h1>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg min-w-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                  Emails Processados Hoje
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{metrics.emailsToday}</p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg min-w-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                  Tempo Estimado Economizado
                </p>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Estimativa: {minutesPerEmail} min por email
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{metrics.timeSaved}</p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-muted/80 backdrop-blur-sm">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                    "rounded-lg border-2 border-dashed p-6 sm:p-8 text-center transition-colors cursor-pointer relative min-h-[140px] flex items-center justify-center",
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
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-colors shrink-0",
                      isDragging ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Upload className={cn(
                        "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <p className="text-sm font-medium text-foreground text-center">
                      Arraste o conteúdo do email
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      ou clique para selecionar (.txt ou .pdf)
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
                      <div className="flex items-center justify-between min-w-0">
                        <Badge
                          variant={classificationResult.category === "Produtivo" ? "productive" : "unproductive"}
                          className="text-xs sm:text-sm px-2 sm:px-3 py-1 min-w-0 max-w-full truncate"
                        >
                          {classificationResult.category === "Produtivo"
                            ? "Produtivo - Ação Necessária"
                            : "Improdutivo"}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground text-center">
                          Confiança desta análise
                        </p>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                          O quanto a IA confia nesta classificação (0–100%)
                        </p>
                        <CircularProgress value={confidencePercentage} size={100} strokeWidth={8} />
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowOriginalEmail((v) => !v)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            E-mail classificado
                          </span>
                          {showOriginalEmail ? (
                            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                        {showOriginalEmail && (
                          <div className="border-t border-border px-3 py-3 space-y-2 max-h-48 overflow-y-auto">
                            {emailSubject && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-0.5">Assunto</p>
                                <p className="text-sm text-foreground">{emailSubject}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">Conteúdo</p>
                              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {classificationResult.original_content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">
                        Editor de Resposta Inteligente
                      </h4>
                      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/50 p-2">
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
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleCopyResponse}
                        className="flex-1 min-w-0"
                        disabled={!smartReply}
                      >
                        <Copy className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">Copiar Resposta</span>
                      </Button>
                      <Button
                        onClick={handleOpenInGmail}
                        className="flex-1 min-w-0"
                        disabled={!smartReply}
                      >
                        <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">Abrir no Gmail</span>
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
    </MainLayout>
  )
}
