export type ClassificationCategory = "Produtivo" | "Improdutivo"

export interface EmailInput {
  content?: string
  subject?: string
}

export interface EmailClassificationResponse {
  category: ClassificationCategory
  confidence: number
  suggested_response: string
  original_content: string
  processed_at: string
}

export interface ApiError {
  detail: string
}
