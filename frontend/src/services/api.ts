import axios, { CancelTokenSource } from "axios"
import { EmailInput, EmailClassificationResponse } from "@/types"

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
})
let currentRequestSource: CancelTokenSource | null = null

export const emailService = {
  classifyText: async (input: EmailInput): Promise<EmailClassificationResponse> => {
    if (currentRequestSource) {
      currentRequestSource.cancel("Nova requisição iniciada")
    }
    
    // Cria novo token de cancelamento
    currentRequestSource = axios.CancelToken.source()
    
    try {
      const response = await api.post<EmailClassificationResponse>(
        "/classify", 
        input,
        { cancelToken: currentRequestSource.token }
      )
      currentRequestSource = null
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error("Requisição cancelada")
      }
      currentRequestSource = null
      throw error
    }
  },
  classifyFile: async (file: File, subject?: string): Promise<EmailClassificationResponse> => {
    if (currentRequestSource) {
      currentRequestSource.cancel("Nova requisição iniciada")
    }
    
    // Cria novo token de cancelamento
    currentRequestSource = axios.CancelToken.source()
    
    const formData = new FormData()
    formData.append("file", file)
    if (subject) {
      formData.append("subject", subject)
    }
    
    try {
      const response = await api.post<EmailClassificationResponse>(
        "/classify/upload", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: currentRequestSource.token,
        }
      )
      currentRequestSource = null
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error("Requisição cancelada")
      }
      currentRequestSource = null
      throw error
    }
  },
}

export default api
