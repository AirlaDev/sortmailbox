import { useState } from "react"
import { Header } from "@/components/header"
import { EmailUploadForm } from "@/components/email-upload-form"
import { ResultDisplay } from "@/components/result-display"
import { FeatureCards } from "@/components/feature-cards"
import { EmailClassificationResponse } from "@/types"

export default function Home() {
  const [result, setResult] = useState<EmailClassificationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResult = (data: EmailClassificationResponse) => {
    setResult(data)
  }

  const handleReset = () => {
    setResult(null)
    setIsLoading(false)
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Classificador Inteligente de Emails
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Utilize Inteligência Artificial para classificar automaticamente seus emails 
            e receber sugestões de respostas personalizadas.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <EmailUploadForm 
              onResult={handleResult} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <ResultDisplay 
              result={result} 
              isLoading={isLoading}
              onReset={handleReset}
            />
          </div>
        </div>
        <div className="mt-12 md:mt-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <FeatureCards />
        </div>
      </div>
    </main>
  )
}
