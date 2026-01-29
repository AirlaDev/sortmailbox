import { Brain, Zap, Shield, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "Inteligência Artificial",
    description: "Modelos avançados de NLP para classificação precisa de emails",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Processamento Rápido",
    description: "Análise instantânea do conteúdo com respostas em segundos",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Seus dados são processados com total privacidade",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: BarChart3,
    title: "Alta Precisão",
    description: "Classificações precisas com nível de confiança detalhado",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
]

export function FeatureCards() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Por que usar o AutoU?
        </h2>
        <p className="text-muted-foreground">
          Automatize a classificação de emails e economize tempo da sua equipe
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
