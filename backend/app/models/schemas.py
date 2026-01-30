from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime

class ClassificationCategory(str, Enum):
    PRODUTIVO = "Produtivo"
    IMPRODUTIVO = "Improdutivo"

class EmailInput(BaseModel):
    """Entrada para classificação. Funciona para qualquer remetente: a classificação é feita apenas por assunto e conteúdo."""
    content: Optional[str] = Field(None, description="Conteúdo do email em texto")
    subject: Optional[str] = Field(None, description="Assunto do email")
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Olá, gostaria de saber o status da minha solicitação #12345.",
                "subject": "Status da solicitação"
            }
        }

class EmailClassificationResponse(BaseModel):
    category: ClassificationCategory = Field(..., description="Categoria do email")
    confidence: float = Field(..., ge=0, le=1, description="Nível de confiança da classificação")
    suggested_response: str = Field(..., description="Resposta sugerida para o email")
    original_content: str = Field(..., description="Conteúdo original do email")
    processed_at: datetime = Field(default_factory=datetime.now, description="Data/hora do processamento")
    class Config:
        json_schema_extra = {
            "example": {
                "category": "Produtivo",
                "confidence": 0.95,
                "suggested_response": "Prezado(a), agradecemos seu contato. Verificamos sua solicitação #12345 e ela está em processamento.",
                "original_content": "Olá, gostaria de saber o status da minha solicitação #12345.",
                "processed_at": "2024-01-15T10:30:00"
            }
        }

class HealthResponse(BaseModel):
    status: str
    message: str
