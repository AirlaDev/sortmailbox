import axios from "axios"
import { EmailInput, EmailClassificationResponse } from "@/types"

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
})

export const emailService = {
  classifyText: async (input: EmailInput): Promise<EmailClassificationResponse> => {
    const response = await api.post<EmailClassificationResponse>("/classify", input)
    return response.data
  },
  classifyFile: async (file: File, subject?: string): Promise<EmailClassificationResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    if (subject) {
      formData.append("subject", subject)
    }
    const response = await api.post<EmailClassificationResponse>("/classify/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}

export default api
