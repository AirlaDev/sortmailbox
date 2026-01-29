from fastapi import UploadFile
from typing import Optional
from datetime import datetime
from app.models.schemas import EmailInput, EmailClassificationResponse, ClassificationCategory
from app.services.ai_service import AIService
from app.utils.file_processor import FileProcessor
from app.utils.text_processor import TextProcessor

class EmailService:
    def __init__(self):
        self.ai_service = AIService()
        self.file_processor = FileProcessor()
        self.text_processor = TextProcessor()

    async def classify_email(self, email_input: EmailInput) -> EmailClassificationResponse:
        content = email_input.content or ""
        if email_input.subject:
            content = f"Assunto: {email_input.subject}\n\n{content}"
        processed_content = self.text_processor.preprocess(content)
        processed_content = self.text_processor.remove_stop_words(processed_content)
        classification_result = await self.ai_service.classify_text(processed_content)
        category = ClassificationCategory.PRODUTIVO if classification_result["category"] == "Produtivo" else ClassificationCategory.IMPRODUTIVO
        suggested_response = await self.ai_service.generate_response(
            original_content=content,
            category=category.value
        )
        return EmailClassificationResponse(
            category=category,
            confidence=classification_result["confidence"],
            suggested_response=suggested_response,
            original_content=content,
            processed_at=datetime.now()
        )

    async def classify_email_from_file(
        self,
        file: UploadFile,
        subject: Optional[str] = None
    ) -> EmailClassificationResponse:
        content = await self.file_processor.extract_content(file)
        email_input = EmailInput(content=content, subject=subject)
        return await self.classify_email(email_input)
