import { EmailClassificationResponse } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface ClassificationHistoryProps {
  history: Array<EmailClassificationResponse & { subject?: string }>
  limit?: number
}

export function ClassificationHistory({ history, limit }: ClassificationHistoryProps) {
  const displayHistory = limit ? history.slice(0, limit) : history

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Classificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma classificação ainda. Classifique um email para começar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Classificações</CardTitle>
        {limit && history.length > limit && (
          <p className="text-xs text-muted-foreground mt-1">
            Mostrando os {limit} últimos de {history.length} total
          </p>
        )}
      </CardHeader>
      <CardContent>
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
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((item, index) => {
                const confidence = Math.round(item.confidence * 100)
                return (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(item.processed_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground max-w-xs truncate">
                      {item.subject || "Sem assunto"}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
