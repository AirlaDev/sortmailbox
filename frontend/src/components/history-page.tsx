import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { EmailClassificationResponse } from "@/types"

interface HistoryPageProps {
  history: Array<EmailClassificationResponse & { subject?: string }>
  onNavigate: (page: "dashboard" | "history" | "settings" | "login") => void
}

export function HistoryPage({ history, onNavigate }: HistoryPageProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeItem="history" onNavigate={onNavigate} />
      <main className="flex-1 ml-64 overflow-y-auto bg-background relative">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background/95 pointer-events-none -z-10" />
        <div className="container mx-auto p-6 space-y-6 relative z-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Histórico de Classificações</h1>
          </div>
          <Card>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Data
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Assunto
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Classificação
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Confiança
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Conteúdo
                        </th>
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
              )}
            </CardContent>
          </Card>
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Total de Classificações
                      </p>
                      <p className="text-3xl font-bold text-foreground">{history.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Produtivos
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {history.filter((h) => h.category === "Produtivo").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-md border-border/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Improdutivos
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {history.filter((h) => h.category === "Improdutivo").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
