import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { EmailClassificationResponse } from "@/types"
import { cn } from "@/lib/utils"

interface HistoryPageProps {
  history: Array<EmailClassificationResponse & { subject?: string }>
  onNavigate: (page: "dashboard" | "history" | "settings" | "login") => void
}

export function HistoryPage({ history, onNavigate }: HistoryPageProps) {
  return (
    <MainLayout activeItem="history" onNavigate={onNavigate}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate min-w-0">
          Histórico de Classificações
        </h1>
      </div>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Todas as Classificações</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Nenhuma classificação ainda. Classifique um email para começar.
              </p>
            </div>
          ) : (
            <>
              {/* Tabela - desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Assunto</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Classificação</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Confiança</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Conteúdo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => {
                      const confidence = Math.round(item.confidence * 100)
                      return (
                        <tr
                          key={index}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(item.processed_at)}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground max-w-xs">
                            <div className="truncate" title={item.subject || "Sem assunto"}>
                              {item.subject || "Sem assunto"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                item.category === "Produtivo" ? "productive" : "unproductive"
                              }
                              className="text-xs"
                            >
                              {item.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-foreground">
                            {confidence}%
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground max-w-md">
                            <div className="truncate" title={item.original_content}>
                              {item.original_content.substring(0, 100)}
                              {item.original_content.length > 100 ? "..." : ""}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Cards - mobile */}
              <div className="md:hidden space-y-3">
                {history.map((item, index) => {
                  const confidence = Math.round(item.confidence * 100)
                  return (
                    <div
                      key={index}
                      className={cn(
                        "rounded-lg border border-border p-4 space-y-2",
                        "hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">
                          {formatDate(item.processed_at)}
                        </span>
                        <Badge
                          variant={
                            item.category === "Produtivo" ? "productive" : "unproductive"
                          }
                          className="text-xs shrink-0"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate" title={item.subject || "Sem assunto"}>
                        {item.subject || "Sem assunto"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.original_content.substring(0, 120)}
                        {item.original_content.length > 120 ? "..." : ""}
                      </p>
                      <p className="text-sm font-medium text-foreground">{confidence}% confiança</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg min-w-0 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Classificações</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{history.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg min-w-0 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Produtivos</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {history.filter((h) => h.category === "Produtivo").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg min-w-0 overflow-hidden sm:col-span-2 md:col-span-1">
            <CardContent className="p-4 md:p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Improdutivos</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {history.filter((h) => h.category === "Improdutivo").length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  )
}
