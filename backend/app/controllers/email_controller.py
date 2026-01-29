from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.schemas import EmailInput, EmailClassificationResponse
from app.services.email_service import EmailService

router = APIRouter()
email_service = EmailService()
@router.post("/classify", response_model=EmailClassificationResponse)
async def classify_email(email_input: EmailInput):
    try:
        result = await email_service.classify_email(email_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao classificar email: {str(e)}")
@router.post("/classify/upload", response_model=EmailClassificationResponse)
async def classify_email_upload(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None)
):
    allowed_types = [
        "text/plain",
        "application/pdf",
        "application/octet-stream"
    ]
    if file.content_type not in allowed_types and not file.filename.endswith(('.txt', '.pdf')):
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo não suportado. Use .txt ou .pdf"
        )
    try:
        result = await email_service.classify_email_from_file(file, subject)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")
