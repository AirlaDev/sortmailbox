import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

export function FileDropzone({ file, onFileSelect, disabled }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled,
  })

  const removeFile = () => {
    onFileSelect(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (file) {
    return (
      <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">{file.name}</p>
              <p className="text-xs text-green-600">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="h-8 w-8 text-green-600 hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isDragActive ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-6 w-6 transition-colors",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {isDragActive ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos aceitos: .txt, .pdf
          </p>
        </div>
      </div>
    </div>
  )
}
