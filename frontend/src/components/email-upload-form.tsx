import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropzone } from "@/components/file-dropzone"
import { emailService } from "@/services/api"
import { EmailClassificationResponse } from "@/types"

const textFormSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(10, "O conteúdo do email deve ter pelo menos 10 caracteres"),
})
type TextFormData = z.infer<typeof textFormSchema>
interface EmailUploadFormProps {
  onResult: (result: EmailClassificationResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}
export function EmailUploadForm({ onResult, isLoading, setIsLoading }: EmailUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileSubject, setFileSubject] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TextFormData>({
    resolver: zodResolver(textFormSchema),
  })

  const onSubmitText = async (data: TextFormData) => {
    setIsLoading(true)
    try {
      const result = await emailService.classifyText({
        content: data.content,
        subject: data.subject,
      })
      onResult(result)
      toast.success("Email classificado com sucesso!")
      reset()
    } catch (error) {
      toast.error("Erro ao classificar o email. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }
  const onSubmitFile = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo.")
      return
    }
    setIsLoading(true)
    try {
      const result = await emailService.classifyFile(file, fileSubject || undefined)
      onResult(result)
      toast.success("Arquivo processado com sucesso!")
      setFile(null)
      setFileSubject("")
    } catch (error) {
      toast.error("Erro ao processar o arquivo. Verifique o formato e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Enviar Email para Classificação
        </CardTitle>
        <CardDescription>
          Cole o texto do email ou faça upload de um arquivo (.txt ou .pdf)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="text">Digitar Texto</TabsTrigger>
            <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <form onSubmit={handleSubmit(onSubmitText)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto (opcional)</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Solicitação de suporte técnico"
                  {...register("subject")}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo do Email *</Label>
                <Textarea
                  id="content"
                  placeholder="Cole aqui o conteúdo do email que deseja classificar..."
                  className="min-h-[200px]"
                  {...register("content")}
                  disabled={isLoading}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Classificar Email
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-subject">Assunto (opcional)</Label>
                <Input
                  id="file-subject"
                  placeholder="Ex: Solicitação de suporte técnico"
                  value={fileSubject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileSubject(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo do Email *</Label>
                <FileDropzone
                  file={file}
                  onFileSelect={setFile}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={onSubmitFile}
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Classificar Arquivo
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
